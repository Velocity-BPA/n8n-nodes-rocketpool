/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Reward intervals and claim system constants for Rocket Pool
 *
 * Rocket Pool uses a Merkle tree-based reward distribution system.
 * Rewards are calculated off-chain and published on-chain as Merkle roots.
 * Node operators claim their rewards by providing Merkle proofs.
 */

/**
 * Reward interval duration in seconds
 * Rewards are distributed every 28 days (4 weeks)
 */
export const REWARD_INTERVAL_DURATION = 28 * 24 * 60 * 60; // 28 days

/**
 * Reward claim wait period after interval ends
 */
export const REWARD_CLAIM_DELAY = 0; // No delay currently

/**
 * Reward tree IPFS gateway URLs
 */
export const REWARD_TREE_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

/**
 * Reward distribution percentages
 */
export const REWARD_DISTRIBUTION = {
  // Protocol DAO treasury percentage
  PROTOCOL_DAO: 15,
  // Oracle DAO percentage
  ORACLE_DAO: 15,
  // Node operators percentage
  NODE_OPERATORS: 70,
} as const;

/**
 * Reward sources
 */
export enum RewardSource {
  RPLInflation = 'rpl_inflation',
  SmoothingPool = 'smoothing_pool',
  ConsensusLayer = 'consensus_layer',
  ExecutionLayer = 'execution_layer',
}

/**
 * Reward interval info interface
 */
export interface RewardIntervalInfo {
  index: number;
  startTime: number;
  endTime: number;
  consensusStartBlock: number;
  consensusEndBlock: number;
  executionStartBlock: number;
  executionEndBlock: number;
  merkleRoot: string;
  merkleTreeCID: string;
  totalRPL: string;
  totalETH: string;
  isClaimed: boolean;
}

/**
 * Node rewards info interface
 */
export interface NodeRewardsInfo {
  nodeAddress: string;
  rewardIndex: number;
  collateralRPL: string;
  oracleDaoRPL: string;
  smoothingPoolETH: string;
  merkleProof: string[];
  isClaimed: boolean;
}

/**
 * Merkle tree node interface
 */
export interface MerkleTreeNode {
  nodeAddress: string;
  network: number;
  trustedNodeRPL: string;
  collateralRPL: string;
  smoothingPoolETH: string;
  merkleProof: string[];
}

/**
 * Reward claim parameters
 */
export interface RewardClaimParams {
  rewardIndex: number[];
  amountRPL: string[];
  amountETH: string[];
  merkleProof: string[][];
}

/**
 * Reward snapshot data from IPFS
 */
export interface RewardSnapshot {
  rewardsFileVersion: number;
  rocketPoolVersion: string;
  network: string;
  consensusStartBlock: number;
  consensusEndBlock: number;
  executionStartBlock: number;
  executionEndBlock: number;
  intervalsPassed: number;
  merkleRoot: string;
  totalRewards: {
    collateralRpl: string;
    oracleDaoRpl: string;
    smoothingPoolEth: string;
    totalCollateralRpl: string;
    totalOracleDaoRpl: string;
    totalSmoothingPoolEth: string;
  };
  nodeRewards: Record<string, MerkleTreeNode>;
}

/**
 * Calculate the current reward interval index
 */
export function getCurrentRewardInterval(genesisTime: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.floor((now - genesisTime) / REWARD_INTERVAL_DURATION);
}

/**
 * Get the start time of a reward interval
 */
export function getIntervalStartTime(intervalIndex: number, genesisTime: number): number {
  return genesisTime + intervalIndex * REWARD_INTERVAL_DURATION;
}

/**
 * Get the end time of a reward interval
 */
export function getIntervalEndTime(intervalIndex: number, genesisTime: number): number {
  return getIntervalStartTime(intervalIndex + 1, genesisTime);
}

/**
 * Check if a reward interval is claimable
 */
export function isIntervalClaimable(intervalIndex: number, currentIndex: number): boolean {
  return intervalIndex < currentIndex;
}

/**
 * Format reward amounts for display
 */
export function formatRewardAmount(amount: string, decimals: number = 18): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const wholePart = value / divisor;
  const fractionalPart = value % divisor;
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 6);
  return `${wholePart}.${fractionalStr}`;
}

/**
 * Reward tree file naming convention
 */
export function getRewardTreeFileName(network: string, intervalIndex: number): string {
  return `rp-rewards-${network}-${intervalIndex}.json`;
}

/**
 * Smoothing pool eligibility requirements
 */
export const SMOOTHING_POOL_REQUIREMENTS = {
  // Minimum time to be opted in before receiving rewards
  MIN_OPT_IN_TIME: 28 * 24 * 60 * 60, // 28 days
  // Must be opted in at interval end to receive rewards
  OPT_IN_AT_END: true,
} as const;

/**
 * RPL inflation schedule
 */
export const RPL_INFLATION = {
  // Annual inflation rate (5%)
  ANNUAL_RATE: 0.05,
  // Inflation start block (mainnet)
  START_BLOCK: 13322332,
  // Blocks per day (approximate)
  BLOCKS_PER_DAY: 7200,
} as const;

/**
 * Calculate RPL inflation per interval
 */
export function calculateIntervalInflation(totalSupply: bigint): bigint {
  // 5% annual, divided by ~13 intervals per year
  const annualInflation = totalSupply * BigInt(5) / BigInt(100);
  const intervalsPerYear = BigInt(Math.floor(365 / 28));
  return annualInflation / intervalsPerYear;
}
