import { ethers } from 'ethers';
import { EtherscanTx } from '../types';

export interface EthFlowResult {
  eth_in_tx_count: number;
  eth_out_tx_count: number;
  eth_in_unique_senders: number;
  eth_out_unique_receivers: number;
  eth_in_total: string;
  eth_out_total: string;
  eth_net_flow: string;
  eth_in_avg: string;
  eth_in_median: string;
  eth_in_p95: string;
  eth_in_max: string;
  eth_out_avg: string;
  eth_out_median: string;
  eth_out_p95: string;
  eth_out_max: string;
  eth_out_min_nonzero: string;
  dust_threshold_eth: string;
  eth_in_dust_tx_count: number;
  eth_out_dust_tx_count: number;
}

/**
 * Compute ETH flow statistics
 * @param txs - Array of transactions
 * @param subjectAddress - Address being analyzed (checksummed)
 * @param dustThresholdEth - Dust threshold in ETH
 */
export function computeEthFlow(
  txs: EtherscanTx[],
  subjectAddress: string,
  dustThresholdEth: number
): EthFlowResult {
  const subjectLower = subjectAddress.toLowerCase();
  const dustThresholdWei = ethers.parseEther(dustThresholdEth.toString());

  const incomingWei: bigint[] = [];
  const outgoingWei: bigint[] = [];
  const incomingSenders = new Set<string>();
  const outgoingReceivers = new Set<string>();

  let eth_in_dust_tx_count = 0;
  let eth_out_dust_tx_count = 0;

  for (const tx of txs) {
    const value = BigInt(tx.value || '0');
    if (value === 0n) continue;

    const fromLower = tx.from?.toLowerCase() || '';
    const toLower = tx.to?.toLowerCase() || '';

    // Incoming: to == subjectAddress
    if (toLower === subjectLower) {
      incomingWei.push(value);
      if (fromLower) {
        incomingSenders.add(fromLower);
      }
      if (value > 0n && value < dustThresholdWei) {
        eth_in_dust_tx_count++;
      }
    }

    // Outgoing: from == subjectAddress
    if (fromLower === subjectLower) {
      outgoingWei.push(value);
      if (toLower) {
        outgoingReceivers.add(toLower);
      }
      if (value > 0n && value < dustThresholdWei) {
        eth_out_dust_tx_count++;
      }
    }
  }

  // Helper to compute statistics from array of wei values
  function computeStats(values: bigint[]): {
    total: string;
    avg: string;
    median: string;
    p95: string;
    max: string;
    minNonzero: string;
  } {
    if (values.length === 0) {
      return {
        total: '0',
        avg: '0',
        median: '0',
        p95: '0',
        max: '0',
        minNonzero: '0',
      };
    }

    const sorted = [...values].sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    const total = sorted.reduce((sum, val) => sum + val, 0n);
    const avg = total / BigInt(values.length);
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2n
        : sorted[Math.floor(sorted.length / 2)];
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    const p95 = sorted[Math.max(0, p95Index)];
    const max = sorted[sorted.length - 1];
    const minNonzero = sorted.find((v) => v > 0n) || 0n;

    return {
      total: ethers.formatEther(total),
      avg: ethers.formatEther(avg),
      median: ethers.formatEther(median),
      p95: ethers.formatEther(p95),
      max: ethers.formatEther(max),
      minNonzero: ethers.formatEther(minNonzero),
    };
  }

  const inStats = computeStats(incomingWei);
  const outStats = computeStats(outgoingWei);

  // Compute net flow
  const inTotalWei = incomingWei.reduce((sum, val) => sum + val, 0n);
  const outTotalWei = outgoingWei.reduce((sum, val) => sum + val, 0n);
  const netFlowWei = inTotalWei - outTotalWei;
  const eth_net_flow = ethers.formatEther(netFlowWei);

  return {
    eth_in_tx_count: incomingWei.length,
    eth_out_tx_count: outgoingWei.length,
    eth_in_unique_senders: incomingSenders.size,
    eth_out_unique_receivers: outgoingReceivers.size,
    eth_in_total: inStats.total,
    eth_out_total: outStats.total,
    eth_net_flow,
    eth_in_avg: inStats.avg,
    eth_in_median: inStats.median,
    eth_in_p95: inStats.p95,
    eth_in_max: inStats.max,
    eth_out_avg: outStats.avg,
    eth_out_median: outStats.median,
    eth_out_p95: outStats.p95,
    eth_out_max: outStats.max,
    eth_out_min_nonzero: outStats.minNonzero,
    dust_threshold_eth: dustThresholdEth.toString(),
    eth_in_dust_tx_count,
    eth_out_dust_tx_count,
  };
}
