import { ethers } from 'ethers';
import { EtherscanTx } from '../types';
import { fetchNormalTxs } from '../data/etherscan';
import { isTornadoPool } from '../intel/tornado';
import { COUNTERPARTY_TX_CHECK_LIMIT } from '../config';

export interface TornadoExposureResult {
  tornado_counterparty_exposure: boolean;
  counterparties_total: number;
  counterparties_users_total: number;
  counterparties_checked: number;
  counterparties_tornado_exposed_count: number;
  counterparties_tornado_exposed_share: string; // Percentage as string (e.g., "50.00%")
}

/**
 * Compute Tornado counterparty exposure
 * @param txs - Subject address transactions
 * @param provider - Ethers provider for getCode calls
 * @param cap - Maximum number of counterparties to check
 */
export async function computeTornadoExposure(
  txs: EtherscanTx[],
  provider: ethers.Provider,
  cap: number,
  subjectAddress?: string
): Promise<TornadoExposureResult> {
  // First, check if the subject address itself interacted with Tornado pools
  if (subjectAddress) {
    const subjectLower = subjectAddress.toLowerCase();
    const directTornadoTxs = txs.filter((tx) => {
      const toLower = tx.to?.toLowerCase() || '';
      return toLower && isTornadoPool(toLower);
    });
    
    if (directTornadoTxs.length > 0) {
      console.log(`  ⚠️  DIRECT TORNADO INTERACTION DETECTED!`);
      console.log(`     Subject address interacted with Tornado pools in ${directTornadoTxs.length} transaction(s)`);
      directTornadoTxs.forEach((tx, idx) => {
        console.log(`     TX ${idx + 1}: ${tx.hash} -> ${tx.to} (Tornado pool)`);
      });
    }
  }

  // Extract all counterparties (outgoing: to, incoming: from)
  // Exclude the subject address itself from counterparties
  const subjectLower = subjectAddress?.toLowerCase() || '';
  const counterpartiesSet = new Set<string>();
  for (const tx of txs) {
    if (tx.from && tx.from !== '0x' && tx.from !== '') {
      const fromLower = tx.from.toLowerCase();
      if (fromLower !== subjectLower) {
        counterpartiesSet.add(fromLower);
      }
    }
    if (tx.to && tx.to !== '0x' && tx.to !== '') {
      const toLower = tx.to.toLowerCase();
      if (toLower !== subjectLower) {
        counterpartiesSet.add(toLower);
      }
    }
  }
  const counterparties_total = counterpartiesSet.size;
  
  console.log(`  Found ${counterparties_total} unique counterparties`);

  // Filter to EOAs (users) - cache getCode results
  const codeCache = new Map<string, string>();
  const eoaCounterparties: string[] = [];

  async function isContract(address: string): Promise<boolean> {
    if (!address || address === '0x') return false;
    if (codeCache.has(address)) {
      return codeCache.get(address) !== '0x';
    }
    try {
      const code = await provider.getCode(address);
      codeCache.set(address, code);
      return code !== '0x';
    } catch {
      codeCache.set(address, '0x');
      return false;
    }
  }

  // Check each counterparty to see if it's an EOA
  for (const addr of counterpartiesSet) {
    const isContractAddr = await isContract(addr);
    if (!isContractAddr) {
      eoaCounterparties.push(addr);
    }
  }

  const counterparties_users_total = eoaCounterparties.length;

  // Cap the number of counterparties to check
  const toCheck = eoaCounterparties.slice(0, cap);
  const counterparties_checked = toCheck.length;

  // Check each counterparty for Tornado exposure
  // Use serial execution to avoid rate limits (simple approach)
  let counterparties_tornado_exposed_count = 0;

  console.log(`  Checking ${toCheck.length} counterparties for Tornado exposure...`);
  for (let i = 0; i < toCheck.length; i++) {
    const counterparty = toCheck[i];
    try {
      console.log(`    [${i + 1}/${toCheck.length}] Checking counterparty: ${counterparty}`);
      // Fetch counterparty's transactions (smaller limit to reduce API calls)
      const counterpartyTxs = await fetchNormalTxs(
        counterparty,
        COUNTERPARTY_TX_CHECK_LIMIT
      );

      // Check if any transaction has 'to' in Tornado pool allowlist
      const tornadoTxs = counterpartyTxs.filter((tx) => {
        if (!tx.to) return false;
        return isTornadoPool(tx.to);
      });

      if (tornadoTxs.length > 0) {
        counterparties_tornado_exposed_count++;
        console.log(`      ⚠️  TORNADO EXPOSURE FOUND! ${tornadoTxs.length} transaction(s) to Tornado pools:`);
        tornadoTxs.forEach((tx) => {
          console.log(`         TX: ${tx.hash} -> ${tx.to} (Tornado pool)`);
        });
      } else {
        console.log(`      ✓ No Tornado exposure`);
      }

      // Small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      // Check if it's a rate limit error
      const errorMsg = error instanceof Error ? error.message : String(error);
      if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
        console.warn(`      ⚠️  RATE LIMIT: Hit rate limit checking counterparty ${counterparty}`);
        console.warn(`         Consider reducing COUNTERPARTY_CHECK_CAP or adding longer delays`);
        // Still count as failed, but with specific warning
      }
      // If we can't fetch counterparty data, skip it
      // TODO: Better error handling and retry logic
      console.warn(`      ⚠️  Failed to check counterparty ${counterparty}: ${errorMsg}`);
    }
  }

  const tornado_counterparty_exposure =
    counterparties_tornado_exposed_count > 0;
  const counterparties_tornado_exposed_share =
    counterparties_checked > 0
      ? Math.round((counterparties_tornado_exposed_count / counterparties_checked) * 100) + '%'
      : '0%';

  return {
    tornado_counterparty_exposure,
    counterparties_total,
    counterparties_users_total,
    counterparties_checked,
    counterparties_tornado_exposed_count,
    counterparties_tornado_exposed_share,
  };
}
