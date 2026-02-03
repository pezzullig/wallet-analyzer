import { writeCsv } from '../csv';
import { CsvRow } from '../../types';
import fs from 'fs';
import path from 'path';

// Mock csv-writer
jest.mock('csv-writer', () => ({
  createObjectCsvWriter: jest.fn(() => ({
    writeRecords: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('writeCsv', () => {
  const mockCsvRow: CsvRow = {
    // Section 1 - Basics
    input_type: 'address',
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    resolved_address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    chain: 'ethereum',
    network: 'mainnet',
    ens_name: '',
    is_contract: false,
    eth_balance: '1.5',
    eth_balance_wei: '1500000000000000000',
    generated_at: '2024-01-01T00:00:00.000Z',
    // Section 2 - Transaction overview
    analysis_type: 'last_n_txs',
    analysis_size: 200,
    analysis_from: '2024-01-01T00:00:00.000Z',
    analysis_to: '2024-01-02T00:00:00.000Z',
    txlist_truncated: false,
    tx_count: 10,
    active_days: 2,
    tx_per_day: 5,
    max_txs_in_single_day: 6,
    // Section 3 - Transaction type breakdown
    tx_simple_eth_transfer_count: 5,
    tx_contract_call_count: 3,
    tx_contract_creation_count: 2,
    tx_to_contract_count: 4,
    tx_to_eoa_count: 6,
    tx_type_ratio: '5:3:2',
    // Section 4 - ETH flow
    eth_in_tx_count: 3,
    eth_out_tx_count: 7,
    eth_in_unique_senders: 2,
    eth_out_unique_receivers: 5,
    eth_in_total: '2.5',
    eth_out_total: '1.0',
    eth_net_flow: '1.5',
    eth_in_avg: '0.8333333333333334',
    eth_in_median: '0.8',
    eth_in_p95: '1.0',
    eth_in_max: '1.0',
    eth_out_avg: '0.14285714285714285',
    eth_out_median: '0.1',
    eth_out_p95: '0.5',
    eth_out_max: '0.5',
    eth_out_min_nonzero: '0.01',
    dust_threshold_eth: '0.001',
    eth_in_dust_tx_count: 0,
    eth_out_dust_tx_count: 1,
    // Section 6 - Tornado exposure
    tornado_direct_exposure: false,
    tornado_direct_tx_count: 0,
    tornado_counterparty_exposure: false,
    counterparties_total: 10,
    counterparties_users_total: 8,
    counterparties_checked: 5,
    counterparties_tornado_exposed_count: 0,
    counterparties_tornado_exposed_share: '0%',
    // Section 6 - ERC-20 token holdings
    erc20_token_count: 0,
    erc20_top_symbols: '',
    erc20_top_value_usd: '0',
  };

  it('should write CSV file with default filename', async () => {
    const { createObjectCsvWriter } = require('csv-writer');
    const mockWriter = {
      writeRecords: jest.fn().mockResolvedValue(undefined),
    };
    createObjectCsvWriter.mockReturnValue(mockWriter);

    const filePath = await writeCsv(mockCsvRow);

    expect(createObjectCsvWriter).toHaveBeenCalled();
    expect(mockWriter.writeRecords).toHaveBeenCalledWith([mockCsvRow]);
    expect(filePath).toContain('report_');
    expect(filePath).toContain('.csv');
  });

  it('should write CSV file with custom filename', async () => {
    const { createObjectCsvWriter } = require('csv-writer');
    const mockWriter = {
      writeRecords: jest.fn().mockResolvedValue(undefined),
    };
    createObjectCsvWriter.mockReturnValue(mockWriter);

    const customPath = '/tmp/custom_report.csv';
    const filePath = await writeCsv(mockCsvRow, customPath);

    expect(filePath).toBe(customPath);
    expect(createObjectCsvWriter).toHaveBeenCalledWith(
      expect.objectContaining({
        path: customPath,
      })
    );
  });

  it('should sanitize address in default filename', async () => {
    const { createObjectCsvWriter } = require('csv-writer');
    const mockWriter = {
      writeRecords: jest.fn().mockResolvedValue(undefined),
    };
    createObjectCsvWriter.mockReturnValue(mockWriter);

    const rowWithSpecialChars: CsvRow = {
      ...mockCsvRow,
      address: '0xABC123!@#',
    };

    const filePath = await writeCsv(rowWithSpecialChars);

    expect(filePath).toMatch(/report_0xabc123.*\.csv/);
  });

  it('should include all required columns in CSV header', async () => {
    const { createObjectCsvWriter } = require('csv-writer');
    const mockWriter = {
      writeRecords: jest.fn().mockResolvedValue(undefined),
    };
    createObjectCsvWriter.mockReturnValue(mockWriter);

    await writeCsv(mockCsvRow);

    const callArgs = createObjectCsvWriter.mock.calls[0][0];
    const headers = callArgs.header;

    // Check that all major sections are represented
    expect(headers.some((h: any) => h.id === 'input_type')).toBe(true);
    expect(headers.some((h: any) => h.id === 'address')).toBe(true);
    expect(headers.some((h: any) => h.id === 'tx_count')).toBe(true);
    expect(headers.some((h: any) => h.id === 'eth_in_total')).toBe(true);
    expect(headers.some((h: any) => h.id === 'tornado_direct_exposure')).toBe(true);
    expect(headers.some((h: any) => h.id === 'tornado_direct_tx_count')).toBe(true);
    expect(headers.some((h: any) => h.id === 'tornado_counterparty_exposure')).toBe(true);
    expect(headers.some((h: any) => h.id === 'erc20_token_count')).toBe(true);
    expect(headers.some((h: any) => h.id === 'erc20_top_symbols')).toBe(true);
    expect(headers.some((h: any) => h.id === 'erc20_top_value_usd')).toBe(true);
    
    // Should have 55 columns total (53 original + 2 direct exposure)
    expect(headers.length).toBe(55);
  });
});
