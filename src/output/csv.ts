import { createObjectCsvWriter } from 'csv-writer';
import { CsvRow } from '../types';
import path from 'path';
import fs from 'fs';

/**
 * Write CSV row to file
 * @param row - CSV row data
 * @param outputPath - Output file path (default: reports/report_<address>.csv)
 */
export async function writeCsv(row: CsvRow, outputPath?: string): Promise<string> {
  // Sanitize address for filename
  const sanitizeAddress = (addr: string): string => {
    return addr.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  };

  let filePath: string;
  if (outputPath) {
    // Use provided path as-is
    filePath = outputPath;
  } else {
    // Default to reports/ folder
    const reportsDir = path.join(process.cwd(), 'reports');
    // Ensure reports directory exists
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const defaultFilename = `report_${sanitizeAddress(row.address)}.csv`;
    filePath = path.join(reportsDir, defaultFilename);
  }

  // Define column headers in order matching the schema
  const headers = [
    // Section 1 - Basics
    { id: 'input_type', title: 'input_type' },
    { id: 'address', title: 'address' },
    { id: 'resolved_address', title: 'resolved_address' },
    { id: 'chain', title: 'chain' },
    { id: 'network', title: 'network' },
    { id: 'ens_name', title: 'ens_name' },
    { id: 'is_contract', title: 'is_contract' },
    { id: 'eth_balance', title: 'eth_balance' },
    { id: 'eth_balance_wei', title: 'eth_balance_wei' },
    { id: 'generated_at', title: 'generated_at' },
    // Section 2 - ERC-20 token holdings
    { id: 'erc20_token_count', title: 'erc20_token_count' },
    { id: 'erc20_top_symbols', title: 'erc20_top_symbols' },
    { id: 'erc20_top_value_usd', title: 'erc20_top_value_usd' },
    // Section 3 - Transaction overview
    { id: 'analysis_type', title: 'analysis_type' },
    { id: 'analysis_size', title: 'analysis_size' },
    { id: 'analysis_from', title: 'analysis_from' },
    { id: 'analysis_to', title: 'analysis_to' },
    { id: 'txlist_truncated', title: 'txlist_truncated' },
    { id: 'tx_count', title: 'tx_count' },
    { id: 'active_days', title: 'active_days' },
    { id: 'tx_per_day', title: 'tx_per_day' },
    { id: 'max_txs_in_single_day', title: 'max_txs_in_single_day' },
    // Section 4 - Transaction type breakdown
    { id: 'tx_simple_eth_transfer_count', title: 'tx_simple_eth_transfer_count' },
    { id: 'tx_contract_call_count', title: 'tx_contract_call_count' },
    { id: 'tx_contract_creation_count', title: 'tx_contract_creation_count' },
    { id: 'tx_to_contract_count', title: 'tx_to_contract_count' },
    { id: 'tx_to_eoa_count', title: 'tx_to_eoa_count' },
    { id: 'tx_type_ratio', title: 'tx_type_ratio' },
    // Section 5 - ETH flow
    { id: 'eth_in_tx_count', title: 'eth_in_tx_count' },
    { id: 'eth_out_tx_count', title: 'eth_out_tx_count' },
    { id: 'eth_in_unique_senders', title: 'eth_in_unique_senders' },
    { id: 'eth_out_unique_receivers', title: 'eth_out_unique_receivers' },
    { id: 'eth_in_total', title: 'eth_in_total' },
    { id: 'eth_out_total', title: 'eth_out_total' },
    { id: 'eth_net_flow', title: 'eth_net_flow' },
    { id: 'eth_in_avg', title: 'eth_in_avg' },
    { id: 'eth_in_median', title: 'eth_in_median' },
    { id: 'eth_in_p95', title: 'eth_in_p95' },
    { id: 'eth_in_max', title: 'eth_in_max' },
    { id: 'eth_out_avg', title: 'eth_out_avg' },
    { id: 'eth_out_median', title: 'eth_out_median' },
    { id: 'eth_out_p95', title: 'eth_out_p95' },
    { id: 'eth_out_max', title: 'eth_out_max' },
    { id: 'eth_out_min_nonzero', title: 'eth_out_min_nonzero' },
    { id: 'dust_threshold_eth', title: 'dust_threshold_eth' },
    { id: 'eth_in_dust_tx_count', title: 'eth_in_dust_tx_count' },
    { id: 'eth_out_dust_tx_count', title: 'eth_out_dust_tx_count' },
    // Section 6 - Tornado exposure
    // Direct exposure (subject address itself)
    { id: 'tornado_direct_exposure', title: 'tornado_direct_exposure' },
    { id: 'tornado_direct_tx_count', title: 'tornado_direct_tx_count' },
    // Indirect exposure (through counterparties)
    { id: 'tornado_counterparty_exposure', title: 'tornado_counterparty_exposure' },
    { id: 'counterparties_total', title: 'counterparties_total' },
    { id: 'counterparties_users_total', title: 'counterparties_users_total' },
    { id: 'counterparties_checked', title: 'counterparties_checked' },
    { id: 'counterparties_tornado_exposed_count', title: 'counterparties_tornado_exposed_count' },
    { id: 'counterparties_tornado_exposed_share', title: 'counterparties_tornado_exposed_share' },
  ];

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords([row]);

  return filePath;
}
