# Wallet Analyzer

A TypeScript CLI utility that analyzes Ethereum addresses (or ENS names) by fetching real-time data and recent transaction history from public sources, then generates a comprehensive CSV report with detailed metrics including Tornado Cash exposure detection.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following content:
```bash
# Ethereum RPC Provider
# Option 1: Direct RPC URL
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Option 2: Alchemy API Key (will be used to build RPC URL)
# ALCHEMY_API_KEY=your_alchemy_api_key_here

# Etherscan API Key (required for transaction history)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Covalent API Key (optional, for ERC-20 token balance fetching)
# COVALENT_API_KEY=your_covalent_api_key_here
```

Replace the placeholder values with your actual API keys:
- `RPC_URL` (or `ALCHEMY_API_KEY`) - Your Ethereum RPC provider URL or Alchemy API key
- `ETHERSCAN_API_KEY` - Your Etherscan API key (get one at [etherscan.io/apis](https://etherscan.io/apis))
- `COVALENT_API_KEY` - (Optional) Your Covalent API key for ERC-20 token balance fetching (get one at [covalenthq.com](https://www.covalenthq.com/platform/auth/register/))

### 3. Run the Analyzer

**Development mode:**
```bash
npm run dev -- <addressOrEns>
```

**Production mode:**
```bash
npm run build
npm start -- <addressOrEns>
```

**Examples:**
```bash
# Analyze by address
npm start -- 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

# Analyze by ENS
npm start -- vitalik.eth

# Custom output file
npm start -- vitalik.eth --out custom_report.csv

# Custom analysis size
npm start -- vitalik.eth --n 500
```

## What It Does

The tool accepts an Ethereum address or ENS name, fetches the last N normal transactions (default: 200), computes various metrics including transaction patterns, ETH flow statistics, ERC-20 token holdings, and Tornado Cash counterparty exposure, then outputs a single-row CSV file with all the analysis results.

### Analysis Includes

- **Basics**: Balance, ENS name, contract status
- **ERC-20 Token Holdings**: Token count, top token symbols by USD value, total portfolio value
- **Transaction Overview**: Activity patterns, active days, transaction frequency
- **Transaction Types**: Breakdown of simple transfers, contract calls, and contract creations
- **ETH Flow**: Incoming/outgoing statistics, averages, medians, percentiles, dust detection
- **Tornado Exposure**: Detects both direct exposure (subject address sent funds to Tornado Cash pools) and indirect exposure (counterparties have interacted with Tornado Cash pools). Monitors 24 pools: ETH, DAI, USDC, USDT, WBTC, cDAI, cETH

## Output

The tool generates a CSV file (default: `report_<address>.csv`) with a single row containing all computed metrics. The CSV contains **55 columns** organized into 6 sections.

## Documentation

### 📊 [CSV Columns Reference](./CSV_COLUMNS_REFERENCE.md)
Complete reference of all 55 CSV columns organized by section:
- **Section 1 — Basics** (10 columns): Address info, ENS, balance, contract status
- **Section 2 — ERC-20 Token Holdings** (3 columns): Token count, top symbols, USD value
- **Section 3 — Transaction Overview** (9 columns): Activity metrics, date ranges, frequency
- **Section 4 — Transaction Type Breakdown** (6 columns): Transfer types, contract interactions, ratios
- **Section 5 — ETH Flow** (18 columns): In/out statistics, percentiles, dust detection
- **Section 6 — Tornado Exposure** (8 columns): Direct exposure (2 columns) and indirect exposure through counterparties (6 columns)

### 📈 [Analysis Summary](./ANALYSIS_SUMMARY.md)
Summary of findings from sample wallet analyses, including:
- Direct Tornado Cash interaction detection
- Indirect exposure patterns through counterparty connections
- High-value wallet analysis examples
- Detection methodology and coverage details

## Analysis Scope

Metrics are computed over the **last N normal transactions** (default: 200) fetched from Etherscan. The analysis includes:

### Tornado Exposure Definition

The tool detects Tornado Cash exposure in two ways:

**1. Direct Exposure:**
- Checks if the subject address itself sent funds directly to any known Tornado Cash pool
- Reported in `tornado_direct_exposure` (boolean) and `tornado_direct_tx_count` (number)

**2. Indirect Exposure (Counterparty Analysis):**
- Extracts all counterparties (unique addresses the subject interacted with)
- Filters to EOAs (Externally Owned Accounts, i.e., "users")
- Caps the check to the first 25 EOAs (configurable)
- For each checked counterparty, fetches their transaction history and checks if any transaction sent funds to a known Tornado Cash pool address
- Reported in `tornado_counterparty_exposure` and related counterparty metrics

Both direct and indirect exposure are tracked separately in the CSV output to provide clear visibility into the type of exposure detected.

## Build

To build for production:
```bash
npm run build
npm start -- <addressOrEns>
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## TODOs / Future Improvements

- [ ] Pagination beyond N transactions (currently limited to single API call)
- [ ] Internal transaction inclusion (currently only normal transactions)
- [ ] Better rate-limit backoff and retry logic for API calls
- [ ] Enrich transaction typing via logs/method selectors
- [ ] Caching on disk to reduce redundant API calls
- [ ] Support for other EVM chains/networks
- [ ] Parallel counterparty checks with better concurrency control

## License

ISC
