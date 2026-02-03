import dotenv from 'dotenv';
import path from 'path';
import { CovalentBalancesResponse, CovalentTokenBalance } from '../types';
import { COVALENT_BASE_URL, ETHEREUM_CHAIN_ID } from '../config';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getCovalentApiKey(): string | undefined {
  return process.env.COVALENT_API_KEY;
}

/**
 * Fetch ERC-20 token balances for an address from Covalent
 * @param address - Ethereum address (checksummed)
 * @returns Array of token balances
 */
export async function fetchTokenBalances(
  address: string
): Promise<CovalentTokenBalance[]> {
  const apiKey = getCovalentApiKey();
  
  // If no API key, return empty array (graceful degradation)
  if (!apiKey) {
    console.warn('COVALENT_API_KEY not set, skipping ERC-20 token balance fetch');
    return [];
  }

  const url = `${COVALENT_BASE_URL}/${ETHEREUM_CHAIN_ID}/address/${address}/balances_v2/`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (response.status === 429) {
      console.warn('⚠️  RATE LIMIT: Covalent API rate limit exceeded. Please wait before retrying.');
      throw new Error('Covalent API rate limit exceeded (HTTP 429)');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      if (errorText.toLowerCase().includes('rate limit') || response.status === 429) {
        console.warn('⚠️  RATE LIMIT: Covalent API rate limit exceeded.');
        throw new Error('Covalent API rate limit exceeded');
      }
      throw new Error(`Covalent API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as CovalentBalancesResponse;

    if (!data.data || !data.data.items) {
      return [];
    }

    // Filter out ETH (native token) and return only ERC-20 tokens
    // ETH typically has contract_address of null or empty
    return data.data.items.filter(
      (item) => item.contract_address && item.contract_address !== ''
    );
  } catch (error) {
    console.warn(`Failed to fetch token balances from Covalent: ${error}`);
    return [];
  }
}
