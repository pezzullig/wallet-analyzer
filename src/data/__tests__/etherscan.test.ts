import { fetchNormalTxs } from '../etherscan';
import { EtherscanTx } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('fetchNormalTxs', () => {
  const mockAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.env
    process.env.ETHERSCAN_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.ETHERSCAN_API_KEY;
  });

  it('should fetch and return transactions successfully', async () => {
    const mockTxs: EtherscanTx[] = [
      {
        hash: '0x123',
        from: '0xabc',
        to: '0xdef',
        value: '1000000000000000000',
        input: '0x',
        timeStamp: '1704067200',
      },
      {
        hash: '0x456',
        from: '0xdef',
        to: '0xabc',
        value: '2000000000000000000',
        input: '0x',
        timeStamp: '1704153600',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: '1',
        message: 'OK',
        result: mockTxs,
      }),
    });

    const result = await fetchNormalTxs(mockAddress, 10);

    expect(result).toHaveLength(2);
    expect(result[0].hash).toBe('0x123');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('etherscan.io');
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(mockAddress);
  });

  it('should return empty array when no transactions found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: '0',
        message: 'No transactions found',
        result: null,
      }),
    });

    const result = await fetchNormalTxs(mockAddress, 10);

    expect(result).toHaveLength(0);
  });

  it('should throw error on API error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: '0',
        message: 'Invalid API Key',
        result: 'Invalid API Key', // When result is a string, it's an error
      }),
    });

    await expect(fetchNormalTxs(mockAddress, 10)).rejects.toThrow(
      'Etherscan API error: Invalid API Key'
    );
  });

  it('should throw error when API key is missing', async () => {
    delete process.env.ETHERSCAN_API_KEY;

    await expect(fetchNormalTxs(mockAddress, 10)).rejects.toThrow(
      'ETHERSCAN_API_KEY must be set'
    );
  });

  it('should limit results to requested limit', async () => {
    const mockTxs: EtherscanTx[] = Array(100).fill(null).map((_, i) => ({
      hash: `0x${i}`,
      from: '0xabc',
      to: '0xdef',
      value: '1000000000000000000',
      input: '0x',
      timeStamp: '1704067200',
    }));

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: '1',
        message: 'OK',
        result: mockTxs,
      }),
    });

    const result = await fetchNormalTxs(mockAddress, 50);

    expect(result).toHaveLength(50);
  });

  it('should include chainid parameter for V2 API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        status: '1',
        message: 'OK',
        result: [],
      }),
    });

    await fetchNormalTxs(mockAddress, 10);

    const url = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(url).toContain('chainid=1');
  });
});
