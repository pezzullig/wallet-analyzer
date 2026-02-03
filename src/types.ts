// Etherscan API transaction response
export interface EtherscanTx {
  hash: string;
  from: string;
  to: string;
  value: string; // wei as string
  input: string; // hex data
  timeStamp: string; // unix timestamp in seconds
  contractAddress?: string; // present for contract creations
}

// Covalent API token balance response
export interface CovalentTokenBalance {
  contract_address: string;
  contract_name?: string;
  contract_ticker_symbol?: string;
  contract_decimals: number;
  logo_url?: string;
  balance: string;
  quote?: number; // USD value if available
  quote_rate?: number; // USD price per token
}

export interface CovalentBalancesResponse {
  data: {
    address: string;
    items: CovalentTokenBalance[];
  };
}

// CSV row matching the schema document
export interface CsvRow {
  // Section 1 - Basics
  input_type: string;
  address: string;
  resolved_address: string;
  chain: string;
  network: string;
  ens_name: string;
  is_contract: boolean;
  eth_balance: string;
  eth_balance_wei: string;
  generated_at: string;

  // Section 2 - Transaction overview
  analysis_type: string;
  analysis_size: number;
  analysis_from: string;
  analysis_to: string;
  txlist_truncated: boolean;
  tx_count: number;
  active_days: number;
  tx_per_day: number;
  max_txs_in_single_day: number;

  // Section 3 - Transaction type breakdown
  tx_simple_eth_transfer_count: number;
  tx_contract_call_count: number;
  tx_contract_creation_count: number;
  tx_to_contract_count: number;
  tx_to_eoa_count: number;
  tx_type_ratio: string;

  // Section 4 - ETH flow
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

  // Section 6 - Tornado exposure
  // Direct exposure (subject address itself)
  tornado_direct_exposure: boolean;
  tornado_direct_tx_count: number;
  // Indirect exposure (through counterparties)
  tornado_counterparty_exposure: boolean;
  counterparties_total: number;
  counterparties_users_total: number;
  counterparties_checked: number;
  counterparties_tornado_exposed_count: number;
  counterparties_tornado_exposed_share: string; // Percentage as string (e.g., "50%")

  // Section 6 - ERC-20 token holdings
  erc20_token_count: number;
  erc20_top_symbols: string;
  erc20_top_value_usd: string;
}
