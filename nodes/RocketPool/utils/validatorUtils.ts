/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers } from 'ethers';

/**
 * Validator utility functions for Rocket Pool
 *
 * Provides utilities for working with Ethereum 2.0 validators,
 * including pubkey validation, withdrawal credentials, and
 * performance calculations.
 */

/**
 * Validator pubkey length (48 bytes = 96 hex chars + 0x prefix)
 */
export const VALIDATOR_PUBKEY_LENGTH = 98;

/**
 * Withdrawal credentials length (32 bytes = 64 hex chars + 0x prefix)
 */
export const WITHDRAWAL_CREDENTIALS_LENGTH = 66;

/**
 * ETH2 deposit amount (32 ETH in gwei)
 */
export const VALIDATOR_DEPOSIT_GWEI = 32000000000n;

/**
 * Effective balance maximum (32 ETH in gwei)
 */
export const MAX_EFFECTIVE_BALANCE_GWEI = 32000000000n;

/**
 * Slots per epoch
 */
export const SLOTS_PER_EPOCH = 32;

/**
 * Seconds per slot
 */
export const SECONDS_PER_SLOT = 12;

/**
 * Validate a validator pubkey
 *
 * @param pubkey - Validator public key
 * @returns True if valid
 */
export function isValidPubkey(pubkey: string): boolean {
  if (!pubkey.startsWith('0x')) {
    return false;
  }
  if (pubkey.length !== VALIDATOR_PUBKEY_LENGTH) {
    return false;
  }
  return /^0x[0-9a-fA-F]{96}$/.test(pubkey);
}

/**
 * Validate withdrawal credentials
 *
 * @param credentials - Withdrawal credentials
 * @returns True if valid
 */
export function isValidWithdrawalCredentials(credentials: string): boolean {
  if (!credentials.startsWith('0x')) {
    return false;
  }
  if (credentials.length !== WITHDRAWAL_CREDENTIALS_LENGTH) {
    return false;
  }
  return /^0x[0-9a-fA-F]{64}$/.test(credentials);
}

/**
 * Check if withdrawal credentials are Rocket Pool format
 *
 * @param credentials - Withdrawal credentials
 * @returns True if Rocket Pool credentials
 */
export function isRocketPoolWithdrawalCredentials(credentials: string): boolean {
  if (!isValidWithdrawalCredentials(credentials)) {
    return false;
  }
  // Rocket Pool credentials start with 0x01 (BLS)
  return credentials.startsWith('0x01');
}

/**
 * Generate withdrawal credentials from minipool address
 *
 * @param minipoolAddress - Minipool contract address
 * @returns Withdrawal credentials
 */
export function generateWithdrawalCredentials(minipoolAddress: string): string {
  // Type 0x01 + 11 zero bytes + 20 byte address
  const address = minipoolAddress.toLowerCase().replace('0x', '');
  return `0x010000000000000000000000${address}`;
}

/**
 * Extract address from withdrawal credentials
 *
 * @param credentials - Withdrawal credentials
 * @returns Address or null if not BLS credentials
 */
export function extractAddressFromCredentials(credentials: string): string | null {
  if (!credentials.startsWith('0x01')) {
    return null;
  }
  // Address is the last 40 hex chars
  const address = credentials.slice(-40);
  return `0x${address}`;
}

/**
 * Calculate validator effective balance
 *
 * @param balance - Current balance in gwei
 * @returns Effective balance in gwei
 */
export function calculateEffectiveBalance(balance: bigint): bigint {
  // Effective balance is capped at 32 ETH and rounded down to nearest ETH
  const cappedBalance = balance > MAX_EFFECTIVE_BALANCE_GWEI ? MAX_EFFECTIVE_BALANCE_GWEI : balance;
  const ethInGwei = 1000000000n;
  return (cappedBalance / ethInGwei) * ethInGwei;
}

/**
 * Convert gwei to ETH
 *
 * @param gwei - Amount in gwei
 * @returns Amount in ETH
 */
export function gweiToEth(gwei: bigint | string): string {
  const gweiValue = typeof gwei === 'string' ? BigInt(gwei) : gwei;
  return (Number(gweiValue) / 1e9).toFixed(9);
}

/**
 * Convert ETH to gwei
 *
 * @param eth - Amount in ETH
 * @returns Amount in gwei
 */
export function ethToGwei(eth: string | number): bigint {
  const ethValue = typeof eth === 'string' ? parseFloat(eth) : eth;
  return BigInt(Math.floor(ethValue * 1e9));
}

/**
 * Calculate slot from timestamp
 *
 * @param timestamp - Unix timestamp
 * @param genesisTime - Genesis timestamp
 * @returns Slot number
 */
export function timestampToSlot(timestamp: number, genesisTime: number): number {
  if (timestamp < genesisTime) {
    return 0;
  }
  return Math.floor((timestamp - genesisTime) / SECONDS_PER_SLOT);
}

/**
 * Calculate timestamp from slot
 *
 * @param slot - Slot number
 * @param genesisTime - Genesis timestamp
 * @returns Unix timestamp
 */
export function slotToTimestamp(slot: number, genesisTime: number): number {
  return genesisTime + slot * SECONDS_PER_SLOT;
}

/**
 * Calculate epoch from slot
 *
 * @param slot - Slot number
 * @returns Epoch number
 */
export function slotToEpoch(slot: number): number {
  return Math.floor(slot / SLOTS_PER_EPOCH);
}

/**
 * Calculate first slot of epoch
 *
 * @param epoch - Epoch number
 * @returns First slot number
 */
export function epochToSlot(epoch: number): number {
  return epoch * SLOTS_PER_EPOCH;
}

/**
 * Calculate attestation effectiveness
 *
 * @param includedAttestations - Number of included attestations
 * @param expectedAttestations - Expected attestations
 * @returns Effectiveness as percentage
 */
export function calculateAttestationEffectiveness(
  includedAttestations: number,
  expectedAttestations: number,
): number {
  if (expectedAttestations === 0) {
    return 100;
  }
  return (includedAttestations / expectedAttestations) * 100;
}

/**
 * Calculate sync committee participation
 *
 * @param participatedSlots - Slots participated
 * @param totalSlots - Total expected slots
 * @returns Participation percentage
 */
export function calculateSyncParticipation(
  participatedSlots: number,
  totalSlots: number,
): number {
  if (totalSlots === 0) {
    return 100;
  }
  return (participatedSlots / totalSlots) * 100;
}

/**
 * Estimate annual validator rewards
 *
 * @param baseRewardFactor - Network base reward factor
 * @param totalActiveBalance - Total active stake (gwei)
 * @param validatorBalance - Validator effective balance (gwei)
 * @returns Estimated annual rewards (gwei)
 */
export function estimateAnnualRewards(
  baseRewardFactor: bigint,
  totalActiveBalance: bigint,
  validatorBalance: bigint = MAX_EFFECTIVE_BALANCE_GWEI,
): bigint {
  // Simplified calculation - actual rewards depend on many factors
  const baseReward = (validatorBalance * baseRewardFactor) / totalActiveBalance;
  const slotsPerYear = BigInt((365.25 * 24 * 60 * 60) / SECONDS_PER_SLOT);
  return baseReward * slotsPerYear / BigInt(SLOTS_PER_EPOCH);
}

/**
 * Check if validator is eligible for exit
 *
 * @param activationEpoch - Activation epoch
 * @param currentEpoch - Current epoch
 * @param shardCommitteePeriod - Required epochs before exit (default 256)
 * @returns True if eligible
 */
export function isEligibleForExit(
  activationEpoch: number,
  currentEpoch: number,
  shardCommitteePeriod: number = 256,
): boolean {
  return currentEpoch >= activationEpoch + shardCommitteePeriod;
}

/**
 * Calculate withdrawal delay
 *
 * @param exitEpoch - Exit epoch
 * @param withdrawableEpoch - Withdrawable epoch
 * @returns Delay in epochs
 */
export function calculateWithdrawalDelay(exitEpoch: number, withdrawableEpoch: number): number {
  return withdrawableEpoch - exitEpoch;
}

/**
 * Parse validator status string to standardized format
 *
 * @param status - Raw status string
 * @returns Standardized status
 */
export function parseValidatorStatus(status: string): {
  phase: string;
  state: string;
  slashed: boolean;
} {
  const lower = status.toLowerCase();

  if (lower.includes('pending')) {
    return {
      phase: 'pending',
      state: lower.includes('queued') ? 'queued' : 'initialized',
      slashed: false,
    };
  }

  if (lower.includes('active')) {
    return {
      phase: 'active',
      state: lower.includes('exiting') ? 'exiting' : 'ongoing',
      slashed: lower.includes('slashed'),
    };
  }

  if (lower.includes('exited')) {
    return {
      phase: 'exited',
      state: 'completed',
      slashed: lower.includes('slashed'),
    };
  }

  if (lower.includes('withdrawal')) {
    return {
      phase: 'withdrawal',
      state: lower.includes('done') ? 'done' : 'possible',
      slashed: false,
    };
  }

  return {
    phase: 'unknown',
    state: status,
    slashed: false,
  };
}

/**
 * Validate deposit data root
 *
 * @param depositDataRoot - 32-byte deposit data root
 * @returns True if valid format
 */
export function isValidDepositDataRoot(depositDataRoot: string): boolean {
  if (!depositDataRoot.startsWith('0x')) {
    return false;
  }
  if (depositDataRoot.length !== 66) {
    return false;
  }
  return /^0x[0-9a-fA-F]{64}$/.test(depositDataRoot);
}

/**
 * Format pubkey for display
 *
 * @param pubkey - Full pubkey
 * @returns Shortened format
 */
export function formatPubkey(pubkey: string): string {
  if (!pubkey || pubkey.length < 20) {
    return pubkey;
  }
  return `${pubkey.slice(0, 10)}...${pubkey.slice(-8)}`;
}
