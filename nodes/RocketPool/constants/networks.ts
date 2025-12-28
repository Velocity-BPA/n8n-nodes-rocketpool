/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Network configurations for Rocket Pool protocol
 */
export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  beaconUrl: string;
  explorerUrl: string;
  subgraphUrl: string;
  apiUrl: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    beaconUrl: 'https://beaconcha.in',
    explorerUrl: 'https://etherscan.io',
    subgraphUrl: 'https://gateway.thegraph.com/api/[api-key]/subgraphs/id/S9ihna8D733WTEShJ1KctSTCvY1VJ7ihnYcDcBJDDZJ',
    apiUrl: 'https://api.rocketpool.net',
  },
  holesky: {
    name: 'Holesky Testnet',
    chainId: 17000,
    rpcUrl: 'https://rpc.holesky.ethpandaops.io',
    beaconUrl: 'https://holesky.beaconcha.in',
    explorerUrl: 'https://holesky.etherscan.io',
    subgraphUrl: '',
    apiUrl: 'https://api.rocketpool.net',
  },
};

/**
 * Default RPC endpoints by network
 */
export const DEFAULT_RPC_ENDPOINTS: Record<string, string> = {
  mainnet: 'https://eth.llamarpc.com',
  holesky: 'https://rpc.holesky.ethpandaops.io',
};

/**
 * Default beacon chain endpoints
 */
export const DEFAULT_BEACON_ENDPOINTS: Record<string, string> = {
  mainnet: 'https://beaconcha.in/api/v1',
  holesky: 'https://holesky.beaconcha.in/api/v1',
};

/**
 * Chain IDs
 */
export const CHAIN_IDS = {
  MAINNET: 1,
  HOLESKY: 17000,
} as const;

/**
 * Get network configuration by name
 */
export function getNetworkConfig(network: string): NetworkConfig {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Unknown network: ${network}. Supported networks: ${Object.keys(NETWORKS).join(', ')}`);
  }
  return config;
}

/**
 * Get chain ID for network
 */
export function getChainId(network: string): number {
  return getNetworkConfig(network).chainId;
}

/**
 * Validate network name
 */
export function isValidNetwork(network: string): boolean {
  return network in NETWORKS;
}
