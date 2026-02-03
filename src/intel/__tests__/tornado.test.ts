import { isTornadoPool, TORNADO_POOLS } from '../tornado';

describe('tornado', () => {
  it('should identify known Tornado Cash pool addresses', () => {
    const knownPools = Array.from(TORNADO_POOLS);
    
    expect(knownPools.length).toBeGreaterThan(0);
    
    // Test each known pool (case-insensitive matching)
    knownPools.forEach(pool => {
      expect(isTornadoPool(pool)).toBe(true);
      // Should work with lowercase too
      expect(isTornadoPool(pool.toLowerCase())).toBe(true);
      // Should work with uppercase too
      expect(isTornadoPool(pool.toUpperCase())).toBe(true);
    });
  });

  it('should return false for non-Tornado addresses', () => {
    const nonTornadoAddresses = [
      '0x0000000000000000000000000000000000000000',
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    ];

    nonTornadoAddresses.forEach(addr => {
      expect(isTornadoPool(addr)).toBe(false);
    });
  });

  it('should handle empty string', () => {
    expect(isTornadoPool('')).toBe(false);
  });

  it('should handle invalid address format', () => {
    expect(isTornadoPool('not-an-address')).toBe(false);
    expect(isTornadoPool('0x123')).toBe(false);
  });
});
