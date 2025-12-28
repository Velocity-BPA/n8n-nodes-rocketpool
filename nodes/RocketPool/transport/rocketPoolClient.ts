/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { ethers, Contract, Wallet, Provider, JsonRpcProvider } from 'ethers';
import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import {
  CONTRACT_ADDRESSES,
  RETH_ABI,
  RPL_ABI,
  DEPOSIT_POOL_ABI,
  NODE_MANAGER_ABI,
  NODE_STAKING_ABI,
  MINIPOOL_MANAGER_ABI,
  MINIPOOL_ABI,
  NETWORK_PRICES_ABI,
  REWARDS_POOL_ABI,
  AUCTION_MANAGER_ABI,
  SMOOTHING_POOL_ABI,
  MERKLE_DISTRIBUTOR_ABI,
} from '../constants/contracts';
import { NETWORKS, getNetworkConfig } from '../constants/networks';

// License notice - logged once per node load
let licenseNoticeLogged = false;
function logLicenseNotice(): void {
  if (!licenseNoticeLogged) {
    console.warn(
      '[Velocity BPA Licensing Notice] This n8n node is licensed under the Business Source License 1.1 (BSL 1.1). ' +
      'Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA. ' +
      'For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.'
    );
    licenseNoticeLogged = true;
  }
}

/**
 * Rocket Pool client configuration
 */
export interface RocketPoolClientConfig {
  network: string;
  executionRpcUrl: string;
  consensusRpcUrl?: string;
  privateKey?: string;
  subgraphUrl?: string;
}

/**
 * Rocket Pool client for interacting with the protocol
 */
export class RocketPoolClient {
  private provider: JsonRpcProvider;
  private signer?: Wallet;
  private network: string;
  private contracts: Map<string, Contract> = new Map();

  constructor(config: RocketPoolClientConfig) {
    logLicenseNotice();
    
    this.network = config.network;
    this.provider = new JsonRpcProvider(config.executionRpcUrl);

    if (config.privateKey) {
      // Remove 0x prefix if present
      const cleanKey = config.privateKey.startsWith('0x')
        ? config.privateKey.slice(2)
        : config.privateKey;
      this.signer = new Wallet(cleanKey, this.provider);
    }
  }

  /**
   * Get provider instance
   */
  getProvider(): Provider {
    return this.provider;
  }

  /**
   * Get signer instance
   */
  getSigner(): Wallet | undefined {
    return this.signer;
  }

  /**
   * Check if client has signer (can sign transactions)
   */
  hasSigner(): boolean {
    return this.signer !== undefined;
  }

  /**
   * Get signer address
   */
  async getSignerAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available - private key not configured');
    }
    return this.signer.address;
  }

  /**
   * Get contract address for this network
   */
  getContractAddress(contractName: string): string {
    const networkContracts = CONTRACT_ADDRESSES[this.network];
    if (!networkContracts) {
      throw new Error(`Unknown network: ${this.network}`);
    }
    const address = networkContracts[contractName];
    if (!address) {
      throw new Error(`Contract ${contractName} not found for network ${this.network}`);
    }
    return address;
  }

  /**
   * Get or create contract instance
   */
  private getContract(contractName: string, abi: string[]): Contract {
    const key = `${this.network}:${contractName}`;
    if (!this.contracts.has(key)) {
      const address = this.getContractAddress(contractName);
      const signerOrProvider = this.signer || this.provider;
      this.contracts.set(key, new Contract(address, abi, signerOrProvider));
    }
    return this.contracts.get(key)!;
  }

  /**
   * Get minipool contract at a specific address
   */
  getMinipoolContract(address: string): Contract {
    const signerOrProvider = this.signer || this.provider;
    return new Contract(address, MINIPOOL_ABI, signerOrProvider);
  }

  // ==================== Token Contracts ====================

  /**
   * Get rETH contract
   */
  getRethContract(): Contract {
    return this.getContract('rocketTokenRETH', RETH_ABI);
  }

  /**
   * Get RPL contract
   */
  getRplContract(): Contract {
    return this.getContract('rocketTokenRPL', RPL_ABI);
  }

  // ==================== Core Contracts ====================

  /**
   * Get Deposit Pool contract
   */
  getDepositPoolContract(): Contract {
    return this.getContract('rocketDepositPool', DEPOSIT_POOL_ABI);
  }

  /**
   * Get Node Manager contract
   */
  getNodeManagerContract(): Contract {
    return this.getContract('rocketNodeManager', NODE_MANAGER_ABI);
  }

  /**
   * Get Node Staking contract
   */
  getNodeStakingContract(): Contract {
    return this.getContract('rocketNodeStaking', NODE_STAKING_ABI);
  }

  /**
   * Get Minipool Manager contract
   */
  getMinipoolManagerContract(): Contract {
    return this.getContract('rocketMinipoolManager', MINIPOOL_MANAGER_ABI);
  }

  /**
   * Get Network Prices contract
   */
  getNetworkPricesContract(): Contract {
    return this.getContract('rocketNetworkPrices', NETWORK_PRICES_ABI);
  }

  /**
   * Get Rewards Pool contract
   */
  getRewardsPoolContract(): Contract {
    return this.getContract('rocketRewardsPool', REWARDS_POOL_ABI);
  }

  /**
   * Get Auction Manager contract
   */
  getAuctionManagerContract(): Contract {
    return this.getContract('rocketAuctionManager', AUCTION_MANAGER_ABI);
  }

  /**
   * Get Smoothing Pool contract
   */
  getSmoothingPoolContract(): Contract {
    return this.getContract('rocketSmoothingPool', SMOOTHING_POOL_ABI);
  }

  /**
   * Get Merkle Distributor contract
   */
  getMerkleDistributorContract(): Contract {
    return this.getContract('rocketMerkleDistributorMainnet', MERKLE_DISTRIBUTOR_ABI);
  }

  // ==================== Read Operations ====================

  /**
   * Get rETH balance for an address
   */
  async getRethBalance(address: string): Promise<bigint> {
    const reth = this.getRethContract();
    return reth.balanceOf(address);
  }

  /**
   * Get rETH exchange rate
   */
  async getRethExchangeRate(): Promise<bigint> {
    const reth = this.getRethContract();
    return reth.getExchangeRate();
  }

  /**
   * Convert ETH amount to rETH
   */
  async getEthToReth(ethAmount: bigint): Promise<bigint> {
    const reth = this.getRethContract();
    return reth.getRethValue(ethAmount);
  }

  /**
   * Convert rETH amount to ETH
   */
  async getRethToEth(rethAmount: bigint): Promise<bigint> {
    const reth = this.getRethContract();
    return reth.getEthValue(rethAmount);
  }

  /**
   * Check if rETH burning is enabled
   */
  async getBurnEnabled(): Promise<boolean> {
    const reth = this.getRethContract();
    return reth.getBurnEnabled();
  }

  /**
   * Get rETH collateral rate
   */
  async getCollateralRate(): Promise<bigint> {
    const reth = this.getRethContract();
    return reth.getCollateralRate();
  }

  /**
   * Get rETH total supply
   */
  async getRethTotalSupply(): Promise<bigint> {
    const reth = this.getRethContract();
    return reth.totalSupply();
  }

  /**
   * Get RPL balance for an address
   */
  async getRplBalance(address: string): Promise<bigint> {
    const rpl = this.getRplContract();
    return rpl.balanceOf(address);
  }

  /**
   * Get RPL price in ETH
   */
  async getRplPrice(): Promise<bigint> {
    const prices = this.getNetworkPricesContract();
    return prices.getRPLPrice();
  }

  /**
   * Get deposit pool balance
   */
  async getDepositPoolBalance(): Promise<bigint> {
    const depositPool = this.getDepositPoolContract();
    return depositPool.getBalance();
  }

  /**
   * Get deposit pool excess balance
   */
  async getDepositPoolExcess(): Promise<bigint> {
    const depositPool = this.getDepositPoolContract();
    return depositPool.getExcessBalance();
  }

  /**
   * Check if node exists
   */
  async getNodeExists(nodeAddress: string): Promise<boolean> {
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.getNodeExists(nodeAddress);
  }

  /**
   * Get node count
   */
  async getNodeCount(): Promise<bigint> {
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.getNodeCount();
  }

  /**
   * Get node timezone
   */
  async getNodeTimezone(nodeAddress: string): Promise<string> {
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.getNodeTimezoneLocation(nodeAddress);
  }

  /**
   * Get node withdrawal address
   */
  async getNodeWithdrawalAddress(nodeAddress: string): Promise<string> {
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.getNodeWithdrawalAddress(nodeAddress);
  }

  /**
   * Get node smoothing pool status
   */
  async getSmoothingPoolStatus(nodeAddress: string): Promise<boolean> {
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.getSmoothingPoolRegistrationState(nodeAddress);
  }

  /**
   * Get node RPL stake
   */
  async getNodeRplStake(nodeAddress: string): Promise<bigint> {
    const nodeStaking = this.getNodeStakingContract();
    return nodeStaking.getNodeRPLStake(nodeAddress);
  }

  /**
   * Get node effective RPL stake
   */
  async getNodeEffectiveRplStake(nodeAddress: string): Promise<bigint> {
    const nodeStaking = this.getNodeStakingContract();
    return nodeStaking.getNodeEffectiveRPLStake(nodeAddress);
  }

  /**
   * Get node minimum RPL stake
   */
  async getNodeMinRplStake(nodeAddress: string): Promise<bigint> {
    const nodeStaking = this.getNodeStakingContract();
    return nodeStaking.getNodeMinimumRPLStake(nodeAddress);
  }

  /**
   * Get node maximum RPL stake
   */
  async getNodeMaxRplStake(nodeAddress: string): Promise<bigint> {
    const nodeStaking = this.getNodeStakingContract();
    return nodeStaking.getNodeMaximumRPLStake(nodeAddress);
  }

  /**
   * Get total RPL staked
   */
  async getTotalRplStake(): Promise<bigint> {
    const nodeStaking = this.getNodeStakingContract();
    return nodeStaking.getTotalRPLStake();
  }

  /**
   * Get minipool count
   */
  async getMinipoolCount(): Promise<bigint> {
    const minipoolManager = this.getMinipoolManagerContract();
    return minipoolManager.getMinipoolCount();
  }

  /**
   * Get node minipool count
   */
  async getNodeMinipoolCount(nodeAddress: string): Promise<bigint> {
    const minipoolManager = this.getMinipoolManagerContract();
    return minipoolManager.getNodeMinipoolCount(nodeAddress);
  }

  /**
   * Get node minipool at index
   */
  async getNodeMinipoolAt(nodeAddress: string, index: number): Promise<string> {
    const minipoolManager = this.getMinipoolManagerContract();
    return minipoolManager.getNodeMinipoolAt(nodeAddress, index);
  }

  /**
   * Get minipool info
   */
  async getMinipoolInfo(minipoolAddress: string): Promise<{
    status: number;
    nodeFee: bigint;
    nodeDepositBalance: bigint;
    userDepositBalance: bigint;
    nodeDepositAssigned: boolean;
    userDepositAssigned: boolean;
    finalised: boolean;
    vacant: boolean;
    nodeAddress: string;
  }> {
    const minipool = this.getMinipoolContract(minipoolAddress);
    const [
      status,
      nodeFee,
      nodeDepositBalance,
      userDepositBalance,
      nodeDepositAssigned,
      userDepositAssigned,
      finalised,
      vacant,
      nodeAddress,
    ] = await Promise.all([
      minipool.getStatus(),
      minipool.getNodeFee(),
      minipool.getNodeDepositBalance(),
      minipool.getUserDepositBalance(),
      minipool.getNodeDepositAssigned(),
      minipool.getUserDepositAssigned(),
      minipool.getFinalised(),
      minipool.getVacant(),
      minipool.getNodeAddress(),
    ]);

    return {
      status,
      nodeFee,
      nodeDepositBalance,
      userDepositBalance,
      nodeDepositAssigned,
      userDepositAssigned,
      finalised,
      vacant,
      nodeAddress,
    };
  }

  /**
   * Get smoothing pool balance
   */
  async getSmoothingPoolBalance(): Promise<bigint> {
    const smoothingPool = this.getSmoothingPoolContract();
    return smoothingPool.getBalance();
  }

  /**
   * Check if rewards are claimed for an interval
   */
  async isRewardClaimed(rewardIndex: number, nodeAddress: string): Promise<boolean> {
    const merkleDistributor = this.getMerkleDistributorContract();
    return merkleDistributor.isClaimed(rewardIndex, nodeAddress);
  }

  /**
   * Get auction lot count
   */
  async getAuctionLotCount(): Promise<bigint> {
    const auctionManager = this.getAuctionManagerContract();
    return auctionManager.getLotCount();
  }

  // ==================== Write Operations ====================

  /**
   * Stake ETH for rETH
   */
  async stakeEth(amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for staking');
    }
    const depositPool = this.getDepositPoolContract();
    return depositPool.deposit({ value: amountWei });
  }

  /**
   * Burn rETH for ETH
   */
  async burnReth(amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for burning');
    }
    const reth = this.getRethContract();
    return reth.burn(amountWei);
  }

  /**
   * Transfer rETH
   */
  async transferReth(to: string, amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for transfers');
    }
    const reth = this.getRethContract();
    return reth.transfer(to, amountWei);
  }

  /**
   * Approve rETH spending
   */
  async approveReth(spender: string, amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for approvals');
    }
    const reth = this.getRethContract();
    return reth.approve(spender, amountWei);
  }

  /**
   * Transfer RPL
   */
  async transferRpl(to: string, amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for transfers');
    }
    const rpl = this.getRplContract();
    return rpl.transfer(to, amountWei);
  }

  /**
   * Approve RPL spending
   */
  async approveRpl(spender: string, amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for approvals');
    }
    const rpl = this.getRplContract();
    return rpl.approve(spender, amountWei);
  }

  /**
   * Stake RPL for a node
   */
  async stakeRpl(amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for staking');
    }
    const nodeStaking = this.getNodeStakingContract();
    return nodeStaking.stakeRPL(amountWei);
  }

  /**
   * Withdraw RPL from node
   */
  async withdrawRpl(amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for withdrawals');
    }
    const nodeStaking = this.getNodeStakingContract();
    return nodeStaking.withdrawRPL(amountWei);
  }

  /**
   * Register a node
   */
  async registerNode(timezone: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required for registration');
    }
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.registerNode(timezone);
  }

  /**
   * Set withdrawal address
   */
  async setWithdrawalAddress(
    nodeAddress: string,
    withdrawalAddress: string,
    confirm: boolean,
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.setWithdrawalAddress(nodeAddress, withdrawalAddress, confirm);
  }

  /**
   * Set smoothing pool registration state
   */
  async setSmoothingPoolState(state: boolean): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const nodeManager = this.getNodeManagerContract();
    return nodeManager.setSmoothingPoolRegistrationState(state);
  }

  /**
   * Dissolve minipool
   */
  async dissolveMinipool(minipoolAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const minipool = this.getMinipoolContract(minipoolAddress);
    return minipool.dissolve();
  }

  /**
   * Close minipool
   */
  async closeMinipool(minipoolAddress: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const minipool = this.getMinipoolContract(minipoolAddress);
    return minipool.close();
  }

  /**
   * Distribute minipool balance
   */
  async distributeMinipoolBalance(
    minipoolAddress: string,
    rewardsOnly: boolean,
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const minipool = this.getMinipoolContract(minipoolAddress);
    return minipool.distributeBalance(rewardsOnly);
  }

  /**
   * Place auction bid
   */
  async placeBid(lotIndex: number, amountWei: bigint): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const auctionManager = this.getAuctionManagerContract();
    return auctionManager.placeBid(lotIndex, { value: amountWei });
  }

  /**
   * Claim auction lot
   */
  async claimBid(lotIndex: number): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const auctionManager = this.getAuctionManagerContract();
    return auctionManager.claimBid(lotIndex);
  }

  /**
   * Claim rewards
   */
  async claimRewards(
    nodeAddress: string,
    rewardIndexes: number[],
    amountsRPL: bigint[],
    amountsETH: bigint[],
    merkleProofs: string[][],
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available - private key required');
    }
    const merkleDistributor = this.getMerkleDistributorContract();
    return merkleDistributor.claim(
      nodeAddress,
      rewardIndexes,
      amountsRPL,
      amountsETH,
      merkleProofs,
    );
  }

  // ==================== Utility Functions ====================

  /**
   * Parse ETH amount to wei
   */
  static parseEth(amount: string): bigint {
    return ethers.parseEther(amount);
  }

  /**
   * Format wei to ETH string
   */
  static formatEth(wei: bigint): string {
    return ethers.formatEther(wei);
  }

  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(tx: ethers.TransactionRequest): Promise<bigint> {
    return this.provider.estimateGas(tx);
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }
}

/**
 * Create RocketPool client from n8n credentials
 */
export async function createRocketPoolClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialType: string = 'rocketPoolNetwork',
): Promise<RocketPoolClient> {
  const credentials = await context.getCredentials(credentialType);

  const network = credentials.network as string;
  let chainId: number;

  if (network === 'custom') {
    chainId = credentials.chainId as number;
  } else {
    chainId = getNetworkConfig(network).chainId;
  }

  const config: RocketPoolClientConfig = {
    network: network === 'custom' ? 'mainnet' : network, // Use mainnet contracts for custom
    executionRpcUrl: credentials.executionRpcUrl as string,
    consensusRpcUrl: credentials.consensusRpcUrl as string | undefined,
    privateKey: credentials.privateKey as string | undefined,
    subgraphUrl: credentials.subgraphUrl as string | undefined,
  };

  return new RocketPoolClient(config);
}

/**
 * Get network name from credentials
 */
export function getNetworkFromCredentials(credentials: Record<string, unknown>): string {
  const network = credentials.network as string;
  return network === 'custom' ? 'mainnet' : network;
}
