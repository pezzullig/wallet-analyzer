import { ethers } from 'ethers';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getRpcUrl(): string {
  const RPC_URL = process.env.RPC_URL || 
    (process.env.ALCHEMY_API_KEY 
      ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
      : undefined);

  if (!RPC_URL) {
    throw new Error('RPC_URL or ALCHEMY_API_KEY must be set in .env. Current working directory: ' + process.cwd());
  }

  return RPC_URL;
}

// Initialize provider lazily - create it when first accessed
let _provider: ethers.JsonRpcProvider | null = null;

export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(getRpcUrl());
  }
  return _provider;
}

// Export provider - will be initialized on first use
export const provider = getProvider();
