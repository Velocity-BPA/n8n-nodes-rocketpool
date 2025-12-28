/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Minipool types and status definitions for Rocket Pool
 *
 * Minipools are smart contracts that represent individual validators
 * in the Rocket Pool network. Each minipool holds a combination of
 * node operator ETH and protocol-matched ETH.
 */

/**
 * Minipool deposit types
 *
 * Full: 16 ETH from operator, 16 ETH from pool (legacy)
 * Half: 16 ETH from operator, 16 ETH from pool (legacy)
 * Empty: Used for vacant minipool migrations
 * Variable: Current system - 8 ETH (LEB8) or 16 ETH bonds
 */
export enum MinipoolDepositType {
  None = 0,
  Full = 1,
  Half = 2,
  Empty = 3,
  Variable = 4,
}

/**
 * Minipool status values
 */
export enum MinipoolStatus {
  Initialised = 0,
  Prelaunch = 1,
  Staking = 2,
  Withdrawable = 3,
  Dissolved = 4,
}

/**
 * Human-readable minipool status names
 */
export const MINIPOOL_STATUS_NAMES: Record<MinipoolStatus, string> = {
  [MinipoolStatus.Initialised]: 'Initialised',
  [MinipoolStatus.Prelaunch]: 'Prelaunch',
  [MinipoolStatus.Staking]: 'Staking',
  [MinipoolStatus.Withdrawable]: 'Withdrawable',
  [MinipoolStatus.Dissolved]: 'Dissolved',
};

/**
 * Human-readable deposit type names
 */
export const DEPOSIT_TYPE_NAMES: Record<MinipoolDepositType, string> = {
  [MinipoolDepositType.None]: 'None',
  [MinipoolDepositType.Full]: 'Full (32 ETH)',
  [MinipoolDepositType.Half]: 'Half (16 ETH)',
  [MinipoolDepositType.Empty]: 'Empty',
  [MinipoolDepositType.Variable]: 'Variable (LEB)',
};

/**
 * Minipool bond amounts in ETH
 */
export const MINIPOOL_BOND_AMOUNTS = {
  LEB8: '8', // Lower ETH Bond - 8 ETH
  LEB16: '16', // 16 ETH bond
  FULL: '16', // Full bond (legacy)
} as const;

/**
 * Minipool deposit requirements in wei
 */
export const MINIPOOL_DEPOSITS = {
  LEB8: '8000000000000000000', // 8 ETH in wei
  LEB16: '16000000000000000000', // 16 ETH in wei
  FULL: '16000000000000000000', // 16 ETH in wei
} as const;

/**
 * Node commission rates
 * Commission is the percentage of staking rewards the node operator receives
 */
export const NODE_COMMISSION = {
  MIN: 5, // 5%
  MAX: 20, // 20%
  DEFAULT: 14, // 14% (current network setting)
} as const;

/**
 * Minipool interface for returned data
 */
export interface MinipoolInfo {
  address: string;
  nodeAddress: string;
  status: MinipoolStatus;
  statusName: string;
  depositType: MinipoolDepositType;
  depositTypeName: string;
  nodeFee: string;
  nodeDepositBalance: string;
  userDepositBalance: string;
  nodeDepositAssigned: boolean;
  userDepositAssigned: boolean;
  finalised: boolean;
  vacant: boolean;
  pubkey?: string;
  withdrawalCredentials?: string;
}

/**
 * Minipool creation parameters
 */
export interface MinipoolCreationParams {
  bondAmount: string;
  minimumNodeFee: string;
  validatorPubkey: string;
  validatorSignature: string;
  depositDataRoot: string;
  salt: string;
  expectedMinipoolAddress: string;
}

/**
 * Get status name from status number
 */
export function getMinipoolStatusName(status: number): string {
  return MINIPOOL_STATUS_NAMES[status as MinipoolStatus] || 'Unknown';
}

/**
 * Get deposit type name from type number
 */
export function getDepositTypeName(depositType: number): string {
  return DEPOSIT_TYPE_NAMES[depositType as MinipoolDepositType] || 'Unknown';
}

/**
 * Check if minipool is active (Prelaunch or Staking)
 */
export function isMinipoolActive(status: MinipoolStatus): boolean {
  return status === MinipoolStatus.Prelaunch || status === MinipoolStatus.Staking;
}

/**
 * Check if minipool can be dissolved
 */
export function canDissolve(status: MinipoolStatus): boolean {
  return status === MinipoolStatus.Initialised || status === MinipoolStatus.Prelaunch;
}

/**
 * Check if minipool can be closed
 */
export function canClose(status: MinipoolStatus, finalised: boolean): boolean {
  return status === MinipoolStatus.Dissolved ||
         (status === MinipoolStatus.Withdrawable && finalised);
}

/**
 * Validator status on beacon chain
 */
export enum ValidatorStatus {
  Unknown = 0,
  PendingInitialized = 1,
  PendingQueued = 2,
  ActiveOngoing = 3,
  ActiveExiting = 4,
  ActiveSlashed = 5,
  ExitedUnslashed = 6,
  ExitedSlashed = 7,
  WithdrawalPossible = 8,
  WithdrawalDone = 9,
}

/**
 * Human-readable validator status names
 */
export const VALIDATOR_STATUS_NAMES: Record<ValidatorStatus, string> = {
  [ValidatorStatus.Unknown]: 'Unknown',
  [ValidatorStatus.PendingInitialized]: 'Pending Initialized',
  [ValidatorStatus.PendingQueued]: 'Pending Queued',
  [ValidatorStatus.ActiveOngoing]: 'Active',
  [ValidatorStatus.ActiveExiting]: 'Active Exiting',
  [ValidatorStatus.ActiveSlashed]: 'Active Slashed',
  [ValidatorStatus.ExitedUnslashed]: 'Exited Unslashed',
  [ValidatorStatus.ExitedSlashed]: 'Exited Slashed',
  [ValidatorStatus.WithdrawalPossible]: 'Withdrawal Possible',
  [ValidatorStatus.WithdrawalDone]: 'Withdrawal Done',
};
