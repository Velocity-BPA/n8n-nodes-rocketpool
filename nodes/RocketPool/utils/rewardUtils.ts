/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';
import axios from 'axios';
import type { RewardSnapshot, NodeRewardsInfo, RewardIntervalInfo } from '../constants/rewardIntervals';
import { REWARD_TREE_GATEWAYS } from '../constants/rewardIntervals';

/**
 * Reward utility functions for Rocket Pool
 *
 * Rocket Pool uses a Merkle tree-based reward distribution system.
 * Rewards are calculated off-chain by the Oracle DAO and published
 * as Merkle roots on-chain. Node operators claim rewards by providing
 * Merkle proofs.
 */

/**
 * Fetch reward snapshot from IPFS
 *
 * @param cid - IPFS content identifier
 * @returns Reward snapshot data
 */
export async function fetchRewardSnapshot(cid: string): Promise<RewardSnapshot> {
  let lastError: Error | null = null;

  for (const gateway of REWARD_TREE_GATEWAYS) {
    try {
      const url = `${gateway}${cid}`;
      const response = await axios.get(url, { timeout: 30000 });
      return response.data as RewardSnapshot;
    } catch (error) {
      lastError = error as Error;
      continue;
    }
  }

  throw new Error(`Failed to fetch reward snapshot from IPFS: ${lastError?.message}`);
}

/**
 * Get node rewards from snapshot
 *
 * @param snapshot - Reward snapshot
 * @param nodeAddress - Node address
 * @returns Node rewards info or null if not found
 */
export function getNodeRewardsFromSnapshot(
  snapshot: RewardSnapshot,
  nodeAddress: string,
): NodeRewardsInfo | null {
  const normalizedAddress = nodeAddress.toLowerCase();
  const nodeData = snapshot.nodeRewards[normalizedAddress];

  if (!nodeData) {
    return null;
  }

  return {
    nodeAddress: normalizedAddress,
    rewardIndex: snapshot.intervalsPassed,
    collateralRPL: nodeData.collateralRPL,
    oracleDaoRPL: nodeData.trustedNodeRPL,
    smoothingPoolETH: nodeData.smoothingPoolETH,
    merkleProof: nodeData.merkleProof,
    isClaimed: false,
  };
}

/**
 * Calculate total rewards across intervals
 *
 * @param rewards - Array of node rewards
 * @returns Total RPL and ETH rewards
 */
export function calculateTotalRewards(rewards: NodeRewardsInfo[]): {
  totalRPL: bigint;
  totalETH: bigint;
} {
  let totalRPL = BigInt(0);
  let totalETH = BigInt(0);

  for (const reward of rewards) {
    totalRPL += BigInt(reward.collateralRPL);
    totalRPL += BigInt(reward.oracleDaoRPL);
    totalETH += BigInt(reward.smoothingPoolETH);
  }

  return { totalRPL, totalETH };
}

/**
 * Filter unclaimed rewards
 *
 * @param rewards - Array of node rewards
 * @returns Only unclaimed rewards
 */
export function filterUnclaimedRewards(rewards: NodeRewardsInfo[]): NodeRewardsInfo[] {
  return rewards.filter((r) => !r.isClaimed);
}

/**
 * Format rewards for claiming
 *
 * @param rewards - Array of rewards to claim
 * @returns Formatted claim parameters
 */
export function formatClaimParams(rewards: NodeRewardsInfo[]): {
  rewardIndexes: number[];
  amountsRPL: bigint[];
  amountsETH: bigint[];
  merkleProofs: string[][];
} {
  const rewardIndexes: number[] = [];
  const amountsRPL: bigint[] = [];
  const amountsETH: bigint[] = [];
  const merkleProofs: string[][] = [];

  for (const reward of rewards) {
    rewardIndexes.push(reward.rewardIndex);
    amountsRPL.push(BigInt(reward.collateralRPL) + BigInt(reward.oracleDaoRPL));
    amountsETH.push(BigInt(reward.smoothingPoolETH));
    merkleProofs.push(reward.merkleProof);
  }

  return { rewardIndexes, amountsRPL, amountsETH, merkleProofs };
}

/**
 * Estimate claim gas
 *
 * @param numIntervals - Number of intervals to claim
 * @returns Estimated gas
 */
export function estimateClaimGas(numIntervals: number): bigint {
  // Base gas + per-interval gas
  const baseGas = 100000n;
  const perIntervalGas = 50000n;
  return baseGas + perIntervalGas * BigInt(numIntervals);
}

/**
 * Calculate smoothing pool share
 *
 * @param nodeEthMatched - Node's ETH matched in minipools
 * @param totalEthMatched - Total ETH matched in protocol
 * @param poolBalance - Smoothing pool balance
 * @returns Node's share of smoothing pool
 */
export function calculateSmoothingPoolShare(
  nodeEthMatched: bigint,
  totalEthMatched: bigint,
  poolBalance: bigint,
): bigint {
  if (totalEthMatched === BigInt(0)) {
    return BigInt(0);
  }
  return (poolBalance * nodeEthMatched) / totalEthMatched;
}

/**
 * Calculate RPL rewards for a node
 *
 * @param effectiveRplStake - Node's effective RPL stake
 * @param totalEffectiveRplStake - Total effective RPL stake
 * @param intervalRplRewards - Total RPL rewards for interval
 * @returns Node's RPL rewards
 */
export function calculateRplRewards(
  effectiveRplStake: bigint,
  totalEffectiveRplStake: bigint,
  intervalRplRewards: bigint,
): bigint {
  if (totalEffectiveRplStake === BigInt(0)) {
    return BigInt(0);
  }
  return (intervalRplRewards * effectiveRplStake) / totalEffectiveRplStake;
}

/**
 * Format reward amount for display
 *
 * @param amount - Amount in wei
 * @param symbol - Token symbol (ETH, RPL)
 * @param decimals - Display decimals
 * @returns Formatted string
 */
export function formatRewardAmount(
  amount: bigint | string,
  symbol: string = 'ETH',
  decimals: number = 4,
): string {
  const value = typeof amount === 'string' ? BigInt(amount) : amount;
  const formatted = ethers.formatEther(value);
  const num = parseFloat(formatted);
  return `${num.toFixed(decimals)} ${symbol}`;
}

/**
 * Parse reward interval info
 *
 * @param intervalData - Raw interval data
 * @returns Parsed interval info
 */
export function parseIntervalInfo(intervalData: Record<string, unknown>): RewardIntervalInfo {
  return {
    index: intervalData.index as number,
    startTime: intervalData.startTime as number,
    endTime: intervalData.endTime as number,
    consensusStartBlock: intervalData.consensusStartBlock as number,
    consensusEndBlock: intervalData.consensusEndBlock as number,
    executionStartBlock: intervalData.executionStartBlock as number,
    executionEndBlock: intervalData.executionEndBlock as number,
    merkleRoot: intervalData.merkleRoot as string,
    merkleTreeCID: intervalData.merkleTreeCID as string,
    totalRPL: intervalData.totalRPL as string,
    totalETH: intervalData.totalETH as string,
    isClaimed: intervalData.isClaimed as boolean,
  };
}

/**
 * Calculate reward APR for a node
 *
 * @param annualRewardsRPL - Annual RPL rewards in wei
 * @param annualRewardsETH - Annual ETH rewards in wei
 * @param rplStake - RPL stake in wei
 * @param rplPrice - RPL price in ETH (wei)
 * @returns APR as percentage
 */
export function calculateRewardApr(
  annualRewardsRPL: bigint,
  annualRewardsETH: bigint,
  rplStake: bigint,
  rplPrice: bigint,
): number {
  if (rplStake === BigInt(0)) {
    return 0;
  }

  // Convert RPL rewards to ETH value
  const rplRewardsInEth = (annualRewardsRPL * rplPrice) / BigInt(1e18);
  const totalRewardsEth = rplRewardsInEth + annualRewardsETH;

  // Calculate stake value in ETH
  const stakeValueEth = (rplStake * rplPrice) / BigInt(1e18);

  // APR = (rewards / stake) * 100
  return (Number(totalRewardsEth) / Number(stakeValueEth)) * 100;
}

/**
 * Get reward claim deadline
 *
 * @param intervalEndTime - Interval end timestamp
 * @param expiryPeriodSeconds - Claim expiry period (default 1 year)
 * @returns Deadline timestamp
 */
export function getClaimDeadline(
  intervalEndTime: number,
  expiryPeriodSeconds: number = 365 * 24 * 60 * 60,
): number {
  return intervalEndTime + expiryPeriodSeconds;
}

/**
 * Check if rewards are expired
 *
 * @param intervalEndTime - Interval end timestamp
 * @param expiryPeriodSeconds - Claim expiry period
 * @returns True if expired
 */
export function areRewardsExpired(
  intervalEndTime: number,
  expiryPeriodSeconds: number = 365 * 24 * 60 * 60,
): boolean {
  const deadline = getClaimDeadline(intervalEndTime, expiryPeriodSeconds);
  return Date.now() / 1000 > deadline;
}

/**
 * Aggregate rewards by type
 *
 * @param rewards - Array of node rewards
 * @returns Rewards grouped by type
 */
export function aggregateRewardsByType(rewards: NodeRewardsInfo[]): {
  collateralRPL: bigint;
  oracleDaoRPL: bigint;
  smoothingPoolETH: bigint;
} {
  let collateralRPL = BigInt(0);
  let oracleDaoRPL = BigInt(0);
  let smoothingPoolETH = BigInt(0);

  for (const reward of rewards) {
    collateralRPL += BigInt(reward.collateralRPL);
    oracleDaoRPL += BigInt(reward.oracleDaoRPL);
    smoothingPoolETH += BigInt(reward.smoothingPoolETH);
  }

  return { collateralRPL, oracleDaoRPL, smoothingPoolETH };
}
