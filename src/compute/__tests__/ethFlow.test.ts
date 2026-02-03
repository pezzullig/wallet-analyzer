import { computeEthFlow } from '../ethFlow';
import { EtherscanTx } from '../../types';

describe('computeEthFlow', () => {
  const subjectAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  const dustThreshold = 0.001;

  it('should return zeros for empty transaction array', () => {
    const result = computeEthFlow([], subjectAddress, dustThreshold);

    expect(result.eth_in_tx_count).toBe(0);
    expect(result.eth_out_tx_count).toBe(0);
    expect(result.eth_in_total).toBe('0');
    expect(result.eth_out_total).toBe('0');
    // formatEther returns "0.0" for zero bigint
    expect(result.eth_net_flow).toBe('0.0');
  });

  it('should correctly identify incoming transactions', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: '0xabc',
        to: subjectAddress,
        value: '1000000000000000000', // 1 ETH
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x2',
        from: '0xdef',
        to: subjectAddress,
        value: '2000000000000000000', // 2 ETH
        input: '0x',
        timeStamp: '1704067200',
      },
    ];

    const result = computeEthFlow(txs, subjectAddress, dustThreshold);

    expect(result.eth_in_tx_count).toBe(2);
    expect(result.eth_in_unique_senders).toBe(2);
    expect(result.eth_in_total).toBe('3.0'); // 1 + 2 ETH
    expect(result.eth_out_tx_count).toBe(0);
  });

  it('should correctly identify outgoing transactions', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: subjectAddress,
        to: '0xabc',
        value: '1000000000000000000', // 1 ETH
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x2',
        from: subjectAddress,
        to: '0xdef',
        value: '500000000000000000', // 0.5 ETH
        input: '0x',
        timeStamp: '1704067200',
      },
    ];

    const result = computeEthFlow(txs, subjectAddress, dustThreshold);

    expect(result.eth_out_tx_count).toBe(2);
    expect(result.eth_out_unique_receivers).toBe(2);
    expect(result.eth_out_total).toBe('1.5'); // 1 + 0.5 ETH
    expect(result.eth_in_tx_count).toBe(0);
  });

  it('should compute net flow correctly', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: '0xabc',
        to: subjectAddress,
        value: '2000000000000000000', // 2 ETH in
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x2',
        from: subjectAddress,
        to: '0xdef',
        value: '1000000000000000000', // 1 ETH out
        input: '0x',
        timeStamp: '1704067200',
      },
    ];

    const result = computeEthFlow(txs, subjectAddress, dustThreshold);

    expect(result.eth_net_flow).toBe('1.0'); // 2 - 1 = 1 ETH
  });

  it('should detect dust transactions', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: '0xabc',
        to: subjectAddress,
        value: '500000000000000', // 0.0005 ETH (below 0.001 threshold)
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x2',
        from: subjectAddress,
        to: '0xdef',
        value: '200000000000000', // 0.0002 ETH (below threshold)
        input: '0x',
        timeStamp: '1704067200',
      },
    ];

    const result = computeEthFlow(txs, subjectAddress, dustThreshold);

    expect(result.eth_in_dust_tx_count).toBe(1);
    expect(result.eth_out_dust_tx_count).toBe(1);
  });

  it('should compute statistics correctly', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: '0xabc',
        to: subjectAddress,
        value: '1000000000000000000', // 1 ETH
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x2',
        from: '0xdef',
        to: subjectAddress,
        value: '2000000000000000000', // 2 ETH
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x3',
        from: '0xghi',
        to: subjectAddress,
        value: '3000000000000000000', // 3 ETH
        input: '0x',
        timeStamp: '1704067200',
      },
    ];

    const result = computeEthFlow(txs, subjectAddress, dustThreshold);

    expect(result.eth_in_avg).toBe('2.0'); // (1+2+3)/3 = 2
    expect(result.eth_in_max).toBe('3.0');
    expect(result.eth_in_median).toBe('2.0');
  });

  it('should ignore zero-value transactions', () => {
    const txs: EtherscanTx[] = [
      {
        hash: '0x1',
        from: '0xabc',
        to: subjectAddress,
        value: '0',
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x2',
        from: subjectAddress,
        to: '0xdef',
        value: '0',
        input: '0x',
        timeStamp: '1704067200',
      },
    ];

    const result = computeEthFlow(txs, subjectAddress, dustThreshold);

    expect(result.eth_in_tx_count).toBe(0);
    expect(result.eth_out_tx_count).toBe(0);
  });
});
