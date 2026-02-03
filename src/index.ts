import dotenv from 'dotenv';
import path from 'path';

// Load .env file first, before importing other modules
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { ethers } from 'ethers';
import { provider } from './providers/ethProvider';
import { fetchNormalTxs } from './data/etherscan';
import { computeTxOverview } from './compute/txOverview';
import { computeTxTypes } from './compute/txTypes';
import { computeEthFlow } from './compute/ethFlow';
import { computeTornadoExposure } from './compute/tornadoExposure';
import { computeErc20Metrics } from './compute/erc20';
import { fetchTokenBalances } from './data/covalent';
import { writeCsv } from './output/csv';
import { CsvRow, EtherscanTx } from './types';
import {
  ANALYSIS_SIZE,
  COUNTERPARTY_CHECK_CAP,
  DUST_THRESHOLD_ETH,
} from './config';

/**
 * Parse command line arguments
 */
function parseArgs(): {
  input: string;
  output?: string;
  n?: number;
} {
  const args = process.argv.slice(2);
  let input = '';
  let output: string | undefined;
  let n: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out' && i + 1 < args.length) {
      output = args[i + 1];
      i++;
    } else if (args[i] === '--n' && i + 1 < args.length) {
      n = parseInt(args[i + 1], 10);
      if (isNaN(n) || n <= 0) {
        throw new Error('--n must be a positive number');
      }
      i++;
    } else if (!input) {
      input = args[i];
    }
  }

  if (!input) {
    throw new Error('Address or ENS name required');
  }

  return { input, output, n };
}

/**
 * Determine if input is ENS or address
 */
function isEns(input: string): boolean {
  return input.endsWith('.eth');
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Parse arguments
    const { input, output, n } = parseArgs();
    const analysisSize = n || ANALYSIS_SIZE;

    console.log(`Analyzing: ${input}`);
    console.log(`Analysis size: ${analysisSize} transactions`);

    // Determine input type and resolve address
    const input_type = isEns(input) ? 'ens' : 'address';
    let address: string;

    if (input_type === 'ens') {
      const resolved = await provider.resolveName(input);
      if (!resolved) {
        throw new Error(`Failed to resolve ENS name: ${input}`);
      }
      address = ethers.getAddress(resolved); // Checksum
    } else {
      // Validate and checksum address
      try {
        address = ethers.getAddress(input);
      } catch {
        throw new Error(`Invalid Ethereum address: ${input}`);
      }
    }

    const resolved_address = address;

    console.log(`Resolved address: ${address}`);

    // Fetch basic info from RPC
    console.log('Fetching basic info...');
    const [balance, code, ensName] = await Promise.all([
      provider.getBalance(address),
      provider.getCode(address),
      provider.lookupAddress(address).catch(() => null),
    ]);

    const is_contract = code !== '0x';
    const eth_balance = ethers.formatEther(balance);
    const eth_balance_wei = balance.toString();
    const ens_name = ensName || '';

    // Fetch transactions
    console.log(`Fetching last ${analysisSize} transactions...`);
    let txs: EtherscanTx[];
    try {
      txs = await fetchNormalTxs(address, analysisSize);
      console.log(`Fetched ${txs.length} transactions`);
    } catch (error) {
      console.warn(`Failed to fetch transactions: ${error}`);
      console.warn('Continuing with basic info only...');
      txs = [];
    }

    // Compute metrics
    console.log('Computing metrics...');

    const overview = computeTxOverview(txs, analysisSize);
    const txTypes = txs.length > 0 ? await computeTxTypes(txs, provider) : {
      tx_simple_eth_transfer_count: 0,
      tx_contract_call_count: 0,
      tx_contract_creation_count: 0,
      tx_to_contract_count: 0,
      tx_to_eoa_count: 0,
      tx_type_ratio: '0:0:0',
    };
    const ethFlow = computeEthFlow(txs, address, DUST_THRESHOLD_ETH);

    // Tornado exposure (can take a while)
    console.log('Checking Tornado counterparty exposure (this may take a while)...');
    const tornadoExposure = txs.length > 0
      ? await computeTornadoExposure(txs, provider, COUNTERPARTY_CHECK_CAP, address)
      : {
          tornado_counterparty_exposure: false,
          counterparties_total: 0,
          counterparties_users_total: 0,
          counterparties_checked: 0,
          counterparties_tornado_exposed_count: 0,
          counterparties_tornado_exposed_share: '0%',
        };

    // Fetch ERC-20 token balances
    console.log('Fetching ERC-20 token balances...');
    const tokenBalances = await fetchTokenBalances(address);
    const erc20Metrics = computeErc20Metrics(tokenBalances, 5);

    // Assemble CSV row
    const csvRow: CsvRow = {
      // Section 1 - Basics
      input_type,
      address,
      resolved_address,
      chain: 'ethereum',
      network: 'mainnet',
      ens_name,
      is_contract,
      eth_balance,
      eth_balance_wei,
      generated_at: new Date().toISOString(),

      // Section 2 - ERC-20 token holdings
      ...erc20Metrics,

      // Section 3 - Transaction overview
      analysis_type: 'last_n_txs',
      analysis_size: analysisSize,
      analysis_from: overview.analysis_from,
      analysis_to: overview.analysis_to,
      txlist_truncated: overview.txlist_truncated,
      tx_count: overview.tx_count,
      active_days: overview.active_days,
      tx_per_day: overview.tx_per_day,
      max_txs_in_single_day: overview.max_txs_in_single_day,

      // Section 2 - ERC-20 token holdings
      ...erc20Metrics,

      // Section 4 - Transaction type breakdown
      ...txTypes,

      // Section 5 - ETH flow
      ...ethFlow,

      // Section 6 - Tornado counterparty exposure
      ...tornadoExposure,
    };

    // Write CSV
    console.log('Writing CSV...');
    const filePath = await writeCsv(csvRow, output);

    console.log(`\n✓ Analysis complete!`);
    console.log(`  CSV written to: ${filePath}`);
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run main
main();
