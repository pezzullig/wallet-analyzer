import { CovalentTokenBalance } from '../types';

export interface Erc20Result {
  erc20_token_count: number;
  erc20_top_symbols: string;
  erc20_top_value_usd: string;
}

/**
 * Compute ERC-20 token metrics
 * @param tokenBalances - Array of token balances from Covalent
 * @param topN - Number of top tokens to include (default: 5)
 */
export function computeErc20Metrics(
  tokenBalances: CovalentTokenBalance[],
  topN: number = 5
): Erc20Result {
  if (tokenBalances.length === 0) {
    return {
      erc20_token_count: 0,
      erc20_top_symbols: '',
      erc20_top_value_usd: '0',
    };
  }

  // Filter tokens with non-zero balance
  const nonZeroTokens = tokenBalances.filter((token) => {
    const balance = BigInt(token.balance || '0');
    return balance > 0n;
  });

  const erc20_token_count = nonZeroTokens.length;

  if (nonZeroTokens.length === 0) {
    return {
      erc20_token_count: 0,
      erc20_top_symbols: '',
      erc20_top_value_usd: '0',
    };
  }

  // Sort by USD value (quote) if available, otherwise by balance
  const sortedTokens = [...nonZeroTokens].sort((a, b) => {
    const aValue = a.quote || 0;
    const bValue = b.quote || 0;
    
    if (aValue !== bValue) {
      return bValue - aValue; // Descending order
    }
    
    // If no quote, sort by balance
    const aBalance = BigInt(a.balance || '0');
    const bBalance = BigInt(b.balance || '0');
    return bBalance > aBalance ? 1 : -1;
  });

  // Get top N tokens
  const topTokens = sortedTokens.slice(0, topN);
  
  // Extract symbols (use ticker symbol or contract name as fallback)
  const symbols = topTokens
    .map((token) => {
      const symbol = token.contract_ticker_symbol || token.contract_name || 'UNKNOWN';
      return symbol.toUpperCase();
    })
    .filter((symbol) => symbol && symbol !== 'UNKNOWN');
  
  const erc20_top_symbols = symbols.join(';');

  // Calculate total USD value of top tokens
  const totalValueUsd = topTokens.reduce((sum, token) => {
    return sum + (token.quote || 0);
  }, 0);

  const erc20_top_value_usd = totalValueUsd > 0 ? totalValueUsd.toString() : '0';

  return {
    erc20_token_count,
    erc20_top_symbols,
    erc20_top_value_usd,
  };
}
