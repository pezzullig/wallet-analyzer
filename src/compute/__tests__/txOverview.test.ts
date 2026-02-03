import { computeTxOverview } from '../txOverview';
import { EtherscanTx } from '../../types';

describe('computeTxOverview', () => {
  it('should return empty values for empty transaction array', () => {
    const result = computeTxOverview([], 200);
    
    expect(result.tx_count).toBe(0);
    expect(result.active_days).toBe(0);
    expect(result.tx_per_day).toBe(0);
    expect(result.max_txs_in_single_day).toBe(0);
    expect(result.txlist_truncated).toBe(false);
    expect(result.analysis_from).toBe('');
    expect(result.analysis_to).toBe('');
  });

  it('should compute correct metrics for single transaction', () => {
    const tx: EtherscanTx = {
      hash: '0x123',
      from: '0xabc',
      to: '0xdef',
      value: '1000000000000000000',
      input: '0x',
      timeStamp: '1704067200', // 2024-01-01 00:00:00 UTC
    };

    const result = computeTxOverview([tx], 200);

    expect(result.tx_count).toBe(1);
    expect(result.active_days).toBe(1);
    expect(result.tx_per_day).toBe(1);
    expect(result.max_txs_in_single_day).toBe(1);
    expect(result.txlist_truncated).toBe(false);
    expect(result.analysis_from).toContain('2024-01-01');
    expect(result.analysis_to).toContain('2024-01-01');
  });

  it('should compute correct metrics for multiple transactions', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: '0xabc',
        to: '0xdef',
        value: '1000000000000000000',
        input: '0x',
        timeStamp: '1704067200', // 2024-01-01
      },
      {
        hash: '0x2',
        from: '0xabc',
        to: '0xdef',
        value: '2000000000000000000',
        input: '0x',
        timeStamp: '1704153600', // 2024-01-02
      },
      {
        hash: '0x3',
        from: '0xabc',
        to: '0xdef',
        value: '3000000000000000000',
        input: '0x',
        timeStamp: '1704153600', // 2024-01-02 (same day)
      },
    ];

    const result = computeTxOverview(txs, 200);

    expect(result.tx_count).toBe(3);
    expect(result.active_days).toBe(2);
    expect(result.max_txs_in_single_day).toBe(2); // 2 txs on 2024-01-02
    expect(result.txlist_truncated).toBe(false);
  });

  it('should mark as truncated when tx_count equals analysis_size', () => {
    const txs: EtherscanTx[] = Array(200).fill(null).map((_, i) => ({
      hash: `0x${i}`,
      from: '0xabc',
      to: '0xdef',
      value: '1000000000000000000',
      input: '0x',
      timeStamp: String(1704067200 + i * 86400), // One per day
    }));

    const result = computeTxOverview(txs, 200);

    expect(result.tx_count).toBe(200);
    expect(result.txlist_truncated).toBe(true);
  });

  it('should compute tx_per_day correctly', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: '0xabc',
        to: '0xdef',
        value: '1000000000000000000',
        input: '0x',
        timeStamp: '1704067200', // Day 1
      },
      {
        hash: '0x2',
        from: '0xabc',
        to: '0xdef',
        value: '2000000000000000000',
        input: '0x',
        timeStamp: '1704153600', // Day 2 (1 day later = 86400 seconds)
      },
    ];

    const result = computeTxOverview(txs, 200);

    expect(result.tx_count).toBe(2);
    expect(result.active_days).toBe(2);
    // tx_per_day is calculated as tx_count / daysBetween (which is max(1, ceil(diff/86400)))
    // Days between: ceil((1704153600 - 1704067200) / 86400) = ceil(86400 / 86400) = 1
    // But we use max(1, daysBetween), so it's 1 day, giving 2/1 = 2 tx/day
    expect(result.tx_per_day).toBeCloseTo(2, 5);
  });
});
