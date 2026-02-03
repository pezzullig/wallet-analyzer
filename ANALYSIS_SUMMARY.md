# Wallet Analysis Summary

Analysis of 3 Ethereum addresses with Tornado Cash exposure detection.

---

## vitalik.eth
**Address:** `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`  
**ENS:** vitalik.eth  
**Type:** Contract  
**ETH Balance:** 32.1156 ETH  
**ERC-20 Tokens:** 7,868 positions  
**Top Token Value:** $1,285,460.58  
**Transactions Analyzed:** 200  
**Tornado Exposure:** ✓ No  
**Counterparties Checked:** 25 of 47 EOAs

---

## 0x3Ea9f404B46d58E4FA90ec551acF16A1CD057619
**Address:** `0x3Ea9f404B46d58E4FA90ec551acF16A1CD057619`  
**Type:** EOA  
**ETH Balance:** 0.0289 ETH  
**ERC-20 Tokens:** 1 position (WETH)  
**Top Token Value:** $65.40  
**Transactions Analyzed:** 3  
**Tornado Exposure:** ⚠️ **YES - DIRECT INTERACTION**  
**Exposed Share:** 50%  
**Details:** Direct transaction to Tornado Cash 0.1 ETH pool (`0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc`)

---

## 0xdB9751A4624fa32F568ad5Bb8536977a71AcF627
**Address:** `0xdB9751A4624fa32F568ad5Bb8536977a71AcF627`  
**Type:** EOA  
**ETH Balance:** 0.0 ETH  
**ERC-20 Tokens:** 0 positions  
**Transactions Analyzed:** 2  
**Tornado Exposure:** ⚠️ **YES - INDIRECT EXPOSURE**  
**Exposed Share:** 50%  
**Details:** Indirect exposure through counterparty `0x3Ea9f404...` which directly interacted with Tornado Cash

---

## Key Findings

### 1. Direct Tornado Cash Interaction
- **Address:** `0x3Ea9f404B46d58E4FA90ec551acF16A1CD057619`
- **Transaction:** Sent ETH directly to Tornado Cash 0.1 ETH pool
- **TX Hash:** `0xa6c73fad0a8edbc60e2f96bc41c082a734b0705064fa621eff5dfa2eb14ab989`
- **Pool:** `0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc`

### 2. Indirect Exposure Pattern
- **Address:** `0xdB9751A4624fa32F568ad5Bb8536977a71AcF627`
- **Pattern:** Low-activity wallet (2 transactions) that interacted with an address that has Tornado exposure
- **Risk:** Indirect connection to Tornado Cash through transaction graph

### 3. High-Value Wallet Analysis
- **Address:** `vitalik.eth`
- **Findings:** 
  - No Tornado Cash exposure detected
  - Extensive token holdings (7,868 positions, $1.28M USD value)
  - High transaction activity (200 txs analyzed, 51 active days)
  - 58 unique counterparties, 47 are EOAs

### 4. Detection Coverage
- **Total Tornado Pools Monitored:** 24 pools (ETH, DAI, USDC, USDT, WBTC, cDAI, cETH)
- **Detection Method:** Direct transaction analysis + counterparty graph traversal
- **Coverage:** Analyzed 25 counterparties per address (capped to manage API rate limits)

---

## Methodology Notes

- **Analysis Window:** Last 200 normal transactions per address (capped to manage API rate limits)
- **Counterparty Check:** Up to 25 EOAs checked per address
- **Rate Limiting:** 200ms delay between API calls, serial execution
- **Direct vs Indirect:** Analyzer detects both direct interactions and exposure through counterparties
