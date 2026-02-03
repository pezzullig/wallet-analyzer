import dotenv from 'dotenv';
import path from 'path';
import { EtherscanTx } from '../types';
import { ETHERSCAN_BASE_URL } from '../config';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getEtherscanApiKey(): string {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    throw new Error('ETHERSCAN_API_KEY must be set in .env');
  }
  return apiKey;
}

/**
 * Fetch normal transactions for an address from Etherscan
 * @param address - Ethereum address (checksummed)
 * @param limit - Maximum number of transactions to fetch
 * @returns Array of transactions (latest first)
 */
export async function fetchNormalTxs(
  address: string,
  limit: number
): Promise<EtherscanTx[]> {
  const url = new URL(ETHERSCAN_BASE_URL);
  url.searchParams.set('module', 'account');
  url.searchParams.set('action', 'txlist');
  url.searchParams.set('chainid', '1'); // Ethereum mainnet chain ID (required for V2 API)
  url.searchParams.set('address', address);
  url.searchParams.set('startblock', '0');
  url.searchParams.set('endblock', '99999999');
  url.searchParams.set('page', '1');
  url.searchParams.set('offset', limit.toString());
  url.searchParams.set('sort', 'desc');
  url.searchParams.set('apikey', getEtherscanApiKey());

  const response = await fetch(url.toString());
  
  // Check for HTTP rate limit status
  if (response.status === 429) {
    console.warn('⚠️  RATE LIMIT: Etherscan API rate limit exceeded. Please wait before retrying.');
    throw new Error('Etherscan API rate limit exceeded (HTTP 429)');
  }
  
  const data = await response.json() as {
    status: string;
    message?: string;
    result?: EtherscanTx[] | null;
  };

  if (data.status === '0') {
    // Empty result or error
    if (data.message === 'No transactions found' || data.result === null) {
      return [];
    }
    // Check for rate limit in error message
    const errorMsg = data.message || 'Unknown error';
    if (errorMsg.toLowerCase().includes('rate limit') || errorMsg.toLowerCase().includes('max rate limit')) {
      console.warn('⚠️  RATE LIMIT: Etherscan API rate limit exceeded in response.');
      throw new Error(`Etherscan API rate limit: ${errorMsg}`);
    }
    // Include the full error message for debugging
    throw new Error(`Etherscan API error: ${errorMsg} (status: ${data.status})`);
  }

  if (data.status !== '1') {
    throw new Error(`Unexpected Etherscan response status: ${data.status}`);
  }

  const txs: EtherscanTx[] = data.result || [];
  return txs.slice(0, limit); // Ensure we don't exceed limit
}
