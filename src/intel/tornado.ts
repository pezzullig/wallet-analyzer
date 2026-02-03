// Tornado Cash pool addresses (all tokens)
// Source: Tornado Cash official deployments on Ethereum mainnet
// Includes ETH, DAI, USDC, USDT, WBTC, cDAI, cETH pools
export const TORNADO_POOLS = new Set([
  // ETH pools
  '0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc', // 0.1 ETH
  '0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936', // 1 ETH
  '0x910Cbd523D972eb0a6f4cAe4618aD62622b39DbF', // 10 ETH
  '0xA160cdAB225685dA1d56aa342Ad8841c3b53f291', // 100 ETH
  
  // DAI pools
  '0x07687e702b410Fa43f4cB4Af7FA097918ffD2730', // 100 DAI
  '0x23773E65ed146A459791799d01336DB287f25334', // 1000 DAI
  '0x722122dF12D4e14e13Ac3b6895a86e84145b6967', // 10000 DAI
  '0xD4B88Df4D29F5CedD6857912842cff3b20C8Cfa3', // 100000 DAI
  
  // USDC pools
  '0xd96f2B1c14Db8458374d9A76FaAD33dBd93058F2', // 100 USDC
  '0x4736dCf1b7A3d580672CcE6E7c65cd5cc9cFBa9D', // 1000 USDC
  '0xD691F27f38B395864Ea86CfC7253969B409c362d', // 10000 USDC
  '0x169AD27A470D064DEDE56a2D3ff727986b15D52B', // 100000 USDC
  
  // USDT pools
  '0x0836222F2B2B24A3F36f9866Ed6F0bce308b3425', // 100 USDT
  '0x178169B423a011fff22B9e3F3abeA13414dDD0F1', // 1000 USDT
  '0x610B717796ad172B316836AC95a2ffad065CeaB4', // 10000 USDT
  '0xbB93e510BbCD0B7beb5A853875f9eC60275CF498', // 100000 USDT
  
  // WBTC pools
  '0x7F367cC41522cE07553e823bf3be79A889DEbe1B', // 0.1 WBTC
  '0x1E34A77868E19A6647b1f2F47B87edbDd6E0f671', // 1 WBTC
  '0xdf231d99Ff8b6c6CBF4E9B9a872705E036e0B274', // 10 WBTC
  '0x9AD122c22D14202532145041aD15730f6d8A546a', // 100 WBTC
  
  // cDAI pools
  '0x8576aCC5C05D6Ce88f4e49bf65BdF0C62F91360C', // 500000 cDAI
  '0x901bb9583b24D97e995513C6778dc6888AB6870e', // 5000000 cDAI
  
  // cETH pools
  '0x7FF9cFad3877F21d41Da833E2F775dB0569eE3D9', // 5000 cETH
  '0x7F19720A857F834887FC9A7bC0a0f5Be7D6052E5', // 50000 cETH
]);

/**
 * Check if an address is a Tornado Cash pool (any token)
 * Case-insensitive comparison
 */
export function isTornadoPool(address: string): boolean {
  if (!address || address === '0x' || address === '') return false;
  // Normalize to lowercase for case-insensitive comparison
  const normalized = address.toLowerCase();
  // Check against all pools (also normalized to lowercase)
  return Array.from(TORNADO_POOLS).some(pool => pool.toLowerCase() === normalized);
}
