/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import axios, { AxiosInstance } from 'axios';
import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { DEFAULT_BEACON_ENDPOINTS } from '../constants/networks';

/**
 * Beacon Chain API client for validator data
 *
 * Provides access to consensus layer data including validator status,
 * balances, attestations, and sync committee participation.
 */

/**
 * Validator info response
 */
export interface ValidatorInfo {
  index: string;
  balance: string;
  status: string;
  validator: {
    pubkey: string;
    withdrawal_credentials: string;
    effective_balance: string;
    slashed: boolean;
    activation_eligibility_epoch: string;
    activation_epoch: string;
    exit_epoch: string;
    withdrawable_epoch: string;
  };
}

/**
 * Validator balance response
 */
export interface ValidatorBalance {
  index: string;
  balance: string;
}

/**
 * Block info response
 */
export interface BeaconBlockInfo {
  slot: string;
  proposer_index: string;
  parent_root: string;
  state_root: string;
  body: {
    attestations: unknown[];
    deposits: unknown[];
    voluntary_exits: unknown[];
    sync_aggregate?: {
      sync_committee_bits: string;
      sync_committee_signature: string;
    };
  };
}

/**
 * Sync committee info
 */
export interface SyncCommitteeInfo {
  validators: string[];
  validator_aggregates: string[][];
}

/**
 * Beacon Chain client configuration
 */
export interface BeaconClientConfig {
  baseUrl: string;
  timeout?: number;
}

/**
 * Beacon Chain API client
 */
export class BeaconClient {
  private client: AxiosInstance;

  constructor(config: BeaconClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get validator info by pubkey or index
   */
  async getValidator(validatorId: string): Promise<ValidatorInfo> {
    const response = await this.client.get(`/eth/v1/beacon/states/head/validators/${validatorId}`);
    return response.data.data;
  }

  /**
   * Get multiple validators
   */
  async getValidators(validatorIds: string[]): Promise<ValidatorInfo[]> {
    const response = await this.client.post('/eth/v1/beacon/states/head/validators', {
      ids: validatorIds,
    });
    return response.data.data;
  }

  /**
   * Get validator balance
   */
  async getValidatorBalance(validatorId: string): Promise<ValidatorBalance> {
    const response = await this.client.get(`/eth/v1/beacon/states/head/validator_balances`, {
      params: { id: validatorId },
    });
    return response.data.data[0];
  }

  /**
   * Get multiple validator balances
   */
  async getValidatorBalances(validatorIds: string[]): Promise<ValidatorBalance[]> {
    const response = await this.client.post('/eth/v1/beacon/states/head/validator_balances', {
      ids: validatorIds,
    });
    return response.data.data;
  }

  /**
   * Get current sync committee
   */
  async getSyncCommittee(stateId: string = 'head'): Promise<SyncCommitteeInfo> {
    const response = await this.client.get(`/eth/v1/beacon/states/${stateId}/sync_committees`);
    return response.data.data;
  }

  /**
   * Get beacon block
   */
  async getBlock(blockId: string = 'head'): Promise<BeaconBlockInfo> {
    const response = await this.client.get(`/eth/v2/beacon/blocks/${blockId}`);
    return response.data.data.message;
  }

  /**
   * Get genesis info
   */
  async getGenesis(): Promise<{
    genesis_time: string;
    genesis_validators_root: string;
    genesis_fork_version: string;
  }> {
    const response = await this.client.get('/eth/v1/beacon/genesis');
    return response.data.data;
  }

  /**
   * Get finality checkpoints
   */
  async getFinalityCheckpoints(stateId: string = 'head'): Promise<{
    previous_justified: { epoch: string; root: string };
    current_justified: { epoch: string; root: string };
    finalized: { epoch: string; root: string };
  }> {
    const response = await this.client.get(`/eth/v1/beacon/states/${stateId}/finality_checkpoints`);
    return response.data.data;
  }

  /**
   * Get attestations for block
   */
  async getBlockAttestations(blockId: string = 'head'): Promise<unknown[]> {
    const response = await this.client.get(`/eth/v1/beacon/blocks/${blockId}/attestations`);
    return response.data.data;
  }

  /**
   * Get node syncing status
   */
  async getSyncingStatus(): Promise<{
    head_slot: string;
    sync_distance: string;
    is_syncing: boolean;
    is_optimistic: boolean;
  }> {
    const response = await this.client.get('/eth/v1/node/syncing');
    return response.data.data;
  }

  /**
   * Get node version
   */
  async getNodeVersion(): Promise<string> {
    const response = await this.client.get('/eth/v1/node/version');
    return response.data.data.version;
  }

  /**
   * Get node health
   */
  async getHealth(): Promise<boolean> {
    try {
      await this.client.get('/eth/v1/node/health');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get state root
   */
  async getStateRoot(stateId: string = 'head'): Promise<string> {
    const response = await this.client.get(`/eth/v1/beacon/states/${stateId}/root`);
    return response.data.data.root;
  }

  /**
   * Get beacon state (large request)
   */
  async getState(stateId: string = 'head'): Promise<unknown> {
    const response = await this.client.get(`/eth/v2/debug/beacon/states/${stateId}`);
    return response.data.data;
  }

  /**
   * Get proposer duties for epoch
   */
  async getProposerDuties(epoch: number): Promise<Array<{
    pubkey: string;
    validator_index: string;
    slot: string;
  }>> {
    const response = await this.client.get(`/eth/v1/validator/duties/proposer/${epoch}`);
    return response.data.data;
  }

  /**
   * Get attestation duties for epoch
   */
  async getAttesterDuties(epoch: number, validatorIndices: string[]): Promise<Array<{
    pubkey: string;
    validator_index: string;
    committee_index: string;
    committee_length: string;
    committees_at_slot: string;
    validator_committee_index: string;
    slot: string;
  }>> {
    const response = await this.client.post(`/eth/v1/validator/duties/attester/${epoch}`, validatorIndices);
    return response.data.data;
  }

  /**
   * Get sync committee duties
   */
  async getSyncCommitteeDuties(epoch: number, validatorIndices: string[]): Promise<Array<{
    pubkey: string;
    validator_index: string;
    validator_sync_committee_indices: string[];
  }>> {
    const response = await this.client.post(`/eth/v1/validator/duties/sync/${epoch}`, validatorIndices);
    return response.data.data;
  }

  /**
   * Calculate validator performance metrics
   */
  async getValidatorPerformance(validatorId: string): Promise<{
    balance: string;
    effectiveBalance: string;
    status: string;
    slashed: boolean;
    activationEpoch: string;
    exitEpoch: string;
  }> {
    const validator = await this.getValidator(validatorId);
    return {
      balance: validator.balance,
      effectiveBalance: validator.validator.effective_balance,
      status: validator.status,
      slashed: validator.validator.slashed,
      activationEpoch: validator.validator.activation_epoch,
      exitEpoch: validator.validator.exit_epoch,
    };
  }

  /**
   * Check if validator is in sync committee
   */
  async isInSyncCommittee(validatorIndex: string, stateId: string = 'head'): Promise<boolean> {
    const syncCommittee = await this.getSyncCommittee(stateId);
    return syncCommittee.validators.includes(validatorIndex);
  }
}

/**
 * Create Beacon client from n8n credentials
 */
export async function createBeaconClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialType: string = 'rocketPoolNetwork',
): Promise<BeaconClient | null> {
  const credentials = await context.getCredentials(credentialType);

  let baseUrl = credentials.consensusRpcUrl as string;

  if (!baseUrl) {
    const network = credentials.network as string;
    if (network === 'custom') {
      return null; // No default for custom networks
    }
    baseUrl = DEFAULT_BEACON_ENDPOINTS[network];
    if (!baseUrl) {
      return null;
    }
  }

  return new BeaconClient({ baseUrl });
}

/**
 * Convert validator status to human-readable string
 */
export function formatValidatorStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending_initialized: 'Pending Initialized',
    pending_queued: 'Pending Queued',
    active_ongoing: 'Active',
    active_exiting: 'Active Exiting',
    active_slashed: 'Active Slashed',
    exited_unslashed: 'Exited (Unslashed)',
    exited_slashed: 'Exited (Slashed)',
    withdrawal_possible: 'Withdrawal Possible',
    withdrawal_done: 'Withdrawal Done',
  };
  return statusMap[status] || status;
}

/**
 * Convert gwei to ETH
 */
export function gweiToEth(gwei: string | bigint): string {
  const gweiValue = typeof gwei === 'string' ? BigInt(gwei) : gwei;
  const eth = Number(gweiValue) / 1e9;
  return eth.toFixed(9);
}

/**
 * Calculate epoch from slot
 */
export function slotToEpoch(slot: number | string, slotsPerEpoch: number = 32): number {
  const slotNum = typeof slot === 'string' ? parseInt(slot, 10) : slot;
  return Math.floor(slotNum / slotsPerEpoch);
}

/**
 * Calculate slot from epoch
 */
export function epochToSlot(epoch: number, slotsPerEpoch: number = 32): number {
  return epoch * slotsPerEpoch;
}
