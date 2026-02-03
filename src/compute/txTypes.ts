import { ethers } from 'ethers';
import { EtherscanTx } from '../types';

export interface TxTypesResult {
  tx_simple_eth_transfer_count: number;
  tx_contract_call_count: number;
  tx_contract_creation_count: number;
  tx_to_contract_count: number;
  tx_to_eoa_count: number;
  tx_type_ratio: string;
}

/**
 * Compute transaction type breakdown
 * @param txs - Array of transactions
 * @param provider - Ethers provider for getCode calls
 * @returns Transaction type counts and ratio
 */
export async function computeTxTypes(
  txs: EtherscanTx[],
  provider: ethers.Provider
): Promise<TxTypesResult> {
  let tx_simple_eth_transfer_count = 0;
  let tx_contract_call_count = 0;
  let tx_contract_creation_count = 0;
  let tx_to_contract_count = 0;
  let tx_to_eoa_count = 0;

  // Cache for getCode results
  const codeCache = new Map<string, string>();

  // Helper to check if address is a contract
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
      // On error, assume EOA
      codeCache.set(address, '0x');
      return false;
    }
  }

  // Process each transaction
  for (const tx of txs) {
    const value = BigInt(tx.value || '0');
    const input = tx.input || '0x';

    // Simple ETH transfer: input is "0x" and value > 0
    if (input === '0x' && value > 0n) {
      tx_simple_eth_transfer_count++;
    }

    // Contract call: input is not "0x"
    if (input !== '0x') {
      tx_contract_call_count++;
    }

    // Contract creation: contractAddress present and not empty, OR to is missing/empty
    if (
      (tx.contractAddress && tx.contractAddress !== '') ||
      !tx.to ||
      tx.to === ''
    ) {
      tx_contract_creation_count++;
    }

    // Check if 'to' is a contract or EOA
    if (tx.to && tx.to !== '') {
      const toIsContract = await isContract(tx.to);
      if (toIsContract) {
        tx_to_contract_count++;
      } else {
        tx_to_eoa_count++;
      }
    }
  }

  // Compute ratio
  const tx_type_ratio = `${tx_simple_eth_transfer_count}:${tx_contract_call_count}:${tx_contract_creation_count}`;

  return {
    tx_simple_eth_transfer_count,
    tx_contract_call_count,
    tx_contract_creation_count,
    tx_to_contract_count,
    tx_to_eoa_count,
    tx_type_ratio,
  };
}
