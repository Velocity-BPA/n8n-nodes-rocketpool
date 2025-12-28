/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';

/**
 * rETH utility functions for Rocket Pool
 *
 * rETH is Rocket Pool's liquid staking token. It represents staked ETH
 * plus accumulated staking rewards. The exchange rate increases over time
 * as staking rewards are earned.
 */

/**
 * rETH info interface
 */
export interface RethInfo {
  totalSupply: string;
  exchangeRate: string;
  collateralRate: string;
  burnEnabled: boolean;
  ethValue: string;
  rethValue: string;
}

/**
 * Convert ETH amount to expected rETH amount
 *
 * @param ethAmount - Amount of ETH in wei
 * @param exchangeRate - Current exchange rate (rETH/ETH * 1e18)
 * @returns Expected rETH amount in wei
 */
export function ethToReth(ethAmount: bigint, exchangeRate: bigint): bigint {
  // rETH = ETH * 1e18 / exchangeRate
  return (ethAmount * BigInt(1e18)) / exchangeRate;
}

/**
 * Convert rETH amount to ETH value
 *
 * @param rethAmount - Amount of rETH in wei
 * @param exchangeRate - Current exchange rate (rETH/ETH * 1e18)
 * @returns ETH value in wei
 */
export function rethToEth(rethAmount: bigint, exchangeRate: bigint): bigint {
  // ETH = rETH * exchangeRate / 1e18
  return (rethAmount * exchangeRate) / BigInt(1e18);
}

/**
 * Calculate the current APR based on exchange rate change
 *
 * @param currentRate - Current exchange rate
 * @param previousRate - Previous exchange rate
 * @param timeDiffSeconds - Time difference in seconds
 * @returns APR as a percentage (e.g., 4.5 for 4.5%)
 */
export function calculateRethApr(
  currentRate: bigint,
  previousRate: bigint,
  timeDiffSeconds: number,
): number {
  if (previousRate === BigInt(0) || timeDiffSeconds === 0) {
    return 0;
  }

  // Calculate rate of change
  const rateChange = Number(currentRate - previousRate) / Number(previousRate);

  // Annualize the rate
  const secondsPerYear = 365.25 * 24 * 60 * 60;
  const annualizedRate = rateChange * (secondsPerYear / timeDiffSeconds);

  // Convert to percentage
  return annualizedRate * 100;
}

/**
 * Format exchange rate for display
 *
 * @param exchangeRate - Exchange rate in wei (1e18)
 * @returns Formatted string (e.g., "1.0523")
 */
export function formatExchangeRate(exchangeRate: bigint): string {
  return ethers.formatEther(exchangeRate);
}

/**
 * Calculate effective APY from APR
 *
 * @param apr - Annual percentage rate
 * @param compoundingPeriods - Number of compounding periods per year
 * @returns APY as a percentage
 */
export function aprToApy(apr: number, compoundingPeriods: number = 365): number {
  const rate = apr / 100;
  const apy = Math.pow(1 + rate / compoundingPeriods, compoundingPeriods) - 1;
  return apy * 100;
}

/**
 * Calculate staking rewards earned
 *
 * @param rethBalance - rETH balance in wei
 * @param currentRate - Current exchange rate
 * @param initialRate - Exchange rate when staked (default 1:1)
 * @returns Rewards in ETH (wei)
 */
export function calculateRewardsEarned(
  rethBalance: bigint,
  currentRate: bigint,
  initialRate: bigint = BigInt(1e18),
): bigint {
  const currentEthValue = rethToEth(rethBalance, currentRate);
  const initialEthValue = rethToEth(rethBalance, initialRate);
  return currentEthValue - initialEthValue;
}

/**
 * Estimate time to reach a target rETH exchange rate
 *
 * @param currentRate - Current exchange rate
 * @param targetRate - Target exchange rate
 * @param apr - Current APR percentage
 * @returns Estimated days
 */
export function estimateTimeToRate(
  currentRate: bigint,
  targetRate: bigint,
  apr: number,
): number {
  if (targetRate <= currentRate) {
    return 0;
  }

  const rateIncrease = Number(targetRate - currentRate) / Number(currentRate);
  const dailyRate = apr / 100 / 365;

  return rateIncrease / dailyRate;
}

/**
 * Calculate minimum rETH for a specific ETH amount at current rate
 *
 * @param ethTarget - Target ETH amount in wei
 * @param exchangeRate - Current exchange rate
 * @returns Required rETH amount in wei
 */
export function calculateRequiredReth(ethTarget: bigint, exchangeRate: bigint): bigint {
  return ethToReth(ethTarget, exchangeRate);
}

/**
 * Check if rETH burn is economically viable
 * (comparing against DEX rates)
 *
 * @param rethAmount - Amount to burn
 * @param protocolEthOut - ETH received from protocol burn
 * @param dexEthOut - ETH received from DEX swap
 * @returns True if protocol burn is better
 */
export function isBurnBetterThanDex(
  rethAmount: bigint,
  protocolEthOut: bigint,
  dexEthOut: bigint,
): boolean {
  return protocolEthOut >= dexEthOut;
}

/**
 * Format rETH balance with symbol
 *
 * @param balance - Balance in wei
 * @param decimals - Decimal places to show
 * @returns Formatted string (e.g., "1.5000 rETH")
 */
export function formatRethBalance(balance: bigint, decimals: number = 4): string {
  const formatted = ethers.formatEther(balance);
  const num = parseFloat(formatted);
  return `${num.toFixed(decimals)} rETH`;
}

/**
 * Parse rETH amount string to wei
 *
 * @param amount - Amount string (e.g., "1.5")
 * @returns Amount in wei
 */
export function parseRethAmount(amount: string): bigint {
  return ethers.parseEther(amount);
}

/**
 * Calculate collateralization ratio
 *
 * @param totalEthCollateral - Total ETH backing rETH
 * @param totalRethSupply - Total rETH supply
 * @param exchangeRate - Current exchange rate
 * @returns Collateralization ratio (1.0 = fully collateralized)
 */
export function calculateCollateralRatio(
  totalEthCollateral: bigint,
  totalRethSupply: bigint,
  exchangeRate: bigint,
): number {
  if (totalRethSupply === BigInt(0)) {
    return 1;
  }

  const requiredCollateral = rethToEth(totalRethSupply, exchangeRate);
  return Number(totalEthCollateral) / Number(requiredCollateral);
}

/**
 * Estimate gas cost for rETH operations
 */
export const RETH_GAS_ESTIMATES = {
  STAKE: 150000n, // Deposit ETH for rETH
  BURN: 100000n, // Burn rETH for ETH
  TRANSFER: 65000n, // Transfer rETH
  APPROVE: 46000n, // Approve rETH spending
} as const;
