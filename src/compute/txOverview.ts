import { EtherscanTx } from '../types';

export interface TxOverviewResult {
  analysis_from: string;
  analysis_to: string;
  tx_count: number;
  active_days: number;
  tx_per_day: number;
  max_txs_in_single_day: number;
  txlist_truncated: boolean;
}

/**
 * Compute transaction overview metrics
 */
export function computeTxOverview(
  txs: EtherscanTx[],
  analysisSize: number
): TxOverviewResult {
  if (txs.length === 0) {
    return {
      analysis_from: '',
      analysis_to: '',
      tx_count: 0,
      active_days: 0,
      tx_per_day: 0,
      max_txs_in_single_day: 0,
      txlist_truncated: false,
    };
  }

  // Convert timestamps to ISO (timeStamp is in seconds)
  const timestamps = txs.map((tx) => parseInt(tx.timeStamp, 10) * 1000);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);

  const analysis_from = new Date(minTimestamp).toISOString();
  const analysis_to = new Date(maxTimestamp).toISOString();

  // Compute active days (distinct YYYY-MM-DD)
  const activeDaysSet = new Set<string>();
  for (const timestamp of timestamps) {
    const date = new Date(timestamp);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    activeDaysSet.add(dayKey);
  }
  const active_days = activeDaysSet.size;

  // Compute days between first and last tx
  const daysBetween = Math.max(
    1,
    Math.ceil((maxTimestamp - minTimestamp) / (1000 * 60 * 60 * 24))
  );
  const tx_per_day = txs.length / daysBetween;

  // Compute max txs in a single day
  const dayHistogram = new Map<string, number>();
  for (const timestamp of timestamps) {
    const date = new Date(timestamp);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    dayHistogram.set(dayKey, (dayHistogram.get(dayKey) || 0) + 1);
  }
  const max_txs_in_single_day = Math.max(...Array.from(dayHistogram.values()), 0);

  const txlist_truncated = txs.length === analysisSize;

  return {
    analysis_from,
    analysis_to,
    tx_count: txs.length,
    active_days,
    tx_per_day,
    max_txs_in_single_day,
    txlist_truncated,
  };
}
