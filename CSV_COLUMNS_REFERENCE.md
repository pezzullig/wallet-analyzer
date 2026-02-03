# CSV Columns Reference

Complete reference of all columns in the wallet analyzer CSV output, organized by section.

---

## Section 1 — Basics

| Column | Type | Description |
|--------|------|-------------|
| `input_type` | string | "address" or "ens" - Type of input provided |
| `address` | string | Checksummed Ethereum address analyzed |
| `resolved_address` | string | Same as address, explicit for ENS inputs |
| `chain` | string | Blockchain (constant: "ethereum") |
| `network` | string | Network (constant: "mainnet") |
| `ens_name` | string | Reverse ENS name (blank if none) |
| `is_contract` | boolean | Whether address has deployed bytecode |
| `eth_balance` | string | Balance in ETH (human-readable) |
| `eth_balance_wei` | string | Balance in wei (raw value) |
| `generated_at` | string | ISO timestamp of report generation |

---

## Section 2 — ERC-20 Token Holdings

| Column | Type | Description |
|--------|------|-------------|
| `erc20_token_count` | number | Number of ERC-20 positions held (non-zero balance) |
| `erc20_top_symbols` | string | Top 3–5 token symbols by USD value (joined with `;`) |
| `erc20_top_value_usd` | string | Total USD value of top tokens |

---

## Section 3 — Transaction Overview

| Column | Type | Description |
|--------|------|-------------|
| `analysis_type` | string | How analysis is bounded (constant: "last_n_txs") |
| `analysis_size` | number | Target number of transactions analyzed (default: 200) |
| `analysis_from` | string | Oldest transaction timestamp in sample (ISO format) |
| `analysis_to` | string | Newest transaction timestamp in sample (ISO format) |
| `txlist_truncated` | boolean | Likely more history than fetched (true if tx_count === analysis_size) |
| `tx_count` | number | Number of transactions actually analyzed |
| `active_days` | number | Distinct days with ≥1 transaction |
| `tx_per_day` | number | Average transactions per day over sample date range |
| `max_txs_in_single_day` | number | Peak daily transaction count |

---

## Section 4 — Transaction Type Breakdown

| Column | Type | Description |
|--------|------|-------------|
| `tx_simple_eth_transfer_count` | number | Plain ETH transfers (input == "0x" AND value > 0) |
| `tx_contract_call_count` | number | Contract interactions (input != "0x") |
| `tx_contract_creation_count` | number | Contract creations |
| `tx_to_contract_count` | number | Transactions whose 'to' address has code |
| `tx_to_eoa_count` | number | Transactions whose 'to' address is EOA (no code) |
| `tx_type_ratio` | string | Ratio of simple:contract_call:contract_creation (e.g., "120:75:5") |

---

## Section 5 — ETH Flow

| Column | Type | Description |
|--------|------|-------------|
| `eth_in_tx_count` | number | Incoming value transactions count (to == address AND value > 0) |
| `eth_out_tx_count` | number | Outgoing value transactions count (from == address AND value > 0) |
| `eth_in_unique_senders` | number | Unique senders (Set of 'from' for incoming) |
| `eth_out_unique_receivers` | number | Unique receivers (Set of 'to' for outgoing) |
| `eth_in_total` | string | Total incoming ETH (sum in wei, formatted to ETH) |
| `eth_out_total` | string | Total outgoing ETH (sum in wei, formatted to ETH) |
| `eth_net_flow` | string | Net flow: incoming − outgoing (in ETH) |
| `eth_in_avg` | string | Mean incoming transaction value |
| `eth_in_median` | string | Median incoming transaction value |
| `eth_in_p95` | string | 95th percentile incoming transaction value |
| `eth_in_max` | string | Maximum incoming transaction value |
| `eth_out_avg` | string | Mean outgoing transaction value |
| `eth_out_median` | string | Median outgoing transaction value |
| `eth_out_p95` | string | 95th percentile outgoing transaction value |
| `eth_out_max` | string | Maximum outgoing transaction value |
| `eth_out_min_nonzero` | string | Minimum outgoing transaction value > 0 |
| `dust_threshold_eth` | string | Dust threshold used (default: "0.001") |
| `eth_in_dust_tx_count` | number | Incoming dust transactions (0 < value < threshold) |
| `eth_out_dust_tx_count` | number | Outgoing dust transactions (0 < value < threshold) |

---

## Section 6 — Tornado Exposure

### Direct Exposure (Subject Address Itself)

| Column | Type | Description |
|--------|------|-------------|
| `tornado_direct_exposure` | boolean | Whether the subject address itself sent funds directly to Tornado Cash pools |
| `tornado_direct_tx_count` | number | Number of transactions where the subject address sent funds to Tornado Cash pools |

### Indirect Exposure (Through Counterparties)

| Column | Type | Description |
|--------|------|-------------|
| `tornado_counterparty_exposure` | boolean | Whether any checked counterparty interacted with Tornado Cash pools |
| `counterparties_total` | number | Unique counterparties in sample (outgoing → to, incoming → from) |
| `counterparties_users_total` | number | Unique EOAs among counterparties (filtered using getCode) |
| `counterparties_checked` | number | How many EOAs checked (capped, default: 25) |
| `counterparties_tornado_exposed_count` | number | Checked EOAs with direct pool interaction |
| `counterparties_tornado_exposed_share` | string | Percentage of exposed counterparties (e.g., "50%") |

---

## Column Summary

- **Total Columns:** 55
- **Section 1 (Basics):** 10 columns
- **Section 2 (ERC-20):** 3 columns
- **Section 3 (Transaction Overview):** 9 columns
- **Section 4 (Transaction Types):** 6 columns
- **Section 5 (ETH Flow):** 18 columns
- **Section 6 (Tornado Exposure):** 8 columns (2 direct + 6 indirect)

---

## Notes

- All ETH values are formatted as human-readable strings (e.g., "1.5" for 1.5 ETH)
- Timestamps are in ISO 8601 format
- Percentages are formatted as strings with `%` symbol (e.g., "50%")
- Boolean values are `true`/`false` strings
- Empty/missing values may appear as empty strings or "0" depending on the field type
