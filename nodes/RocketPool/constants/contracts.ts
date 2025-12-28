/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Rocket Pool contract addresses and ABIs
 *
 * These are the core contract addresses for the Rocket Pool protocol.
 * The protocol uses a contract storage pattern where addresses are
 * looked up dynamically from the RocketStorage contract.
 */

/**
 * Core contract addresses by network
 */
export const CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  mainnet: {
    // Core Storage - Entry point for all contract lookups
    rocketStorage: '0x1d8f8f00cfa6758d7bE78336684788Fb0ee0Fa46',

    // Token contracts
    rocketTokenRETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    rocketTokenRPL: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
    rocketTokenRPLFixedSupply: '0xB4EFd85c19999D84251304bDA99E90B92300Bd93',

    // Deposit Pool
    rocketDepositPool: '0xDD3f50F8A6CafbE9b31a427582963f465E745AF8',

    // Minipool contracts
    rocketMinipoolManager: '0x6d010C43d4e96D74C422f2e27370AF48711B49bF',
    rocketMinipoolQueue: '0x9e966733e3E9BFA56aF95f762921859417cF6FaA',
    rocketMinipoolFactory: '0x7B8c48256CaF462670f84c7e849cab216922B8D3',
    rocketMinipoolDelegate: '0xA347C391bc8f740CAbA37672157c8aAcD08Ac567',

    // Node contracts
    rocketNodeManager: '0x89F478E6Cc24f052103628f36598D4C14Da3D287',
    rocketNodeStaking: '0x3019227b2b8493e45Bf5d25302139c9a2713BF15',
    rocketNodeDeposit: '0x2FB42FfE2d7dF8381853e96304300c6a5E846905',
    rocketNodeDistributorFactory: '0xe228017f77B3E0785e794e4c0a8302b0588E29FD',

    // DAO contracts
    rocketDAONodeTrusted: '0xb8e783882b11Ff4f6Cef3C501EA0f4b960152cc9',
    rocketDAONodeTrustedActions: '0x029d946F28F93399a5b0D09c879FC8c94E596AEb',
    rocketDAONodeTrustedProposals: '0xb0ec3F657ef43A615aB480FA8D5A53BF2c2f05d5',
    rocketDAONodeTrustedSettingsMembers: '0xdA1AB39e62E0A5297AF44C7064E501b0613f0D01',
    rocketDAONodeTrustedSettingsProposals: '0xb4D6F8F9CD0dC28a5f7e1c8C4bc47D0aB8C98c3F',
    rocketDAOProtocol: '0x6D736da1dC2562DBeA9998385A0A27d8c2B2793e',
    rocketDAOProtocolProposals: '0x9c14ef2aB5631Fec2cD6a25631538b4c8a7C20Cd',
    rocketDAOProtocolSettingsAuction: '0xCe75f1D048Ab0f7e6f04BDb84b7E1A4D0F282d37',
    rocketDAOProtocolSettingsDeposit: '0xAB1F6c7890dd14d5Ee56f0D5eBe4Cd9a2dBEf226',
    rocketDAOProtocolSettingsInflation: '0x358a7c49189eFBd17C237Eb29893aBD97CC5eB55',
    rocketDAOProtocolSettingsMinipool: '0x42c7dF570C9118F254a16d2e4D8A359C5A37E0d5',
    rocketDAOProtocolSettingsNetwork: '0xC3a618B4AEdf9a71C48E6D18e5A15B1ff0d11E11',
    rocketDAOProtocolSettingsNode: '0x8f2bE4E4C3ec8d02cb51a0d3A3BEfB4e7dE6F53B',
    rocketDAOProtocolSettingsRewards: '0xF4E3C69B8a53Cf5E867e77F3F8B35ab4d33a58f0',

    // Rewards contracts
    rocketRewardsPool: '0xEE4d2a71cF479e0D3d0c3c2C923dbfEB57E73111',
    rocketClaimDAO: '0xFe6Db0Ce3F61fCF3b321EcC7d52E9bA4b0e3b3f1',
    rocketMerkleDistributorMainnet: '0x5cE71E603B138F7e65029Cc1918C0566ed0dBD4B',

    // Network contracts
    rocketNetworkPrices: '0x25E54Bf48369b8FB25bB79d3a3Ff7F3BA448E382',
    rocketNetworkBalances: '0x07FCaBCbe4ff0d80c2b1eb42855C0131b6cba2F4',
    rocketNetworkFees: '0xf824e2d69dc7e7c073162C2bdE87dA4746d27a0f',
    rocketNetworkPenalties: '0xE126a5af0A0Dc5fD50c8fd0d0a51E5eA0c0E4B5F',

    // Auction
    rocketAuctionManager: '0x1a2B3c4D5e6F7890AbCdEf1234567890AbCdEf12',

    // Smoothing Pool
    rocketSmoothingPool: '0xd4E96eF8eee8678dBFf4d535E033Ed1a4F7605b7',
  },
  holesky: {
    // Core Storage
    rocketStorage: '0x594Fb75D3dc2DFa0150Ad03F99F97817747dd4E1',

    // Token contracts
    rocketTokenRETH: '0x7322c24752f79c05FFD1E2a6FCB97020C1C264F1',
    rocketTokenRPL: '0x1Cc9cF5586522c6F483E84A19c3C2B0B6d027bF0',

    // Deposit Pool
    rocketDepositPool: '0x320f3aAB9405e38b955178BBe75c477dECBA0C27',

    // Minipool contracts
    rocketMinipoolManager: '0x3c9Ea71F2C94B1843d1de20557D0d66dC6dA2eFb',

    // Node contracts
    rocketNodeManager: '0x8DdB87E24f7d92D6950Ee5E32f8e46B3f5b0bF5f',
    rocketNodeStaking: '0x0D8D8f8541B12A0e1194B7CC4b6D954b90AB82ec',

    // Other contracts would be added as needed for testnet
  },
};

/**
 * ERC20 token decimals
 */
export const TOKEN_DECIMALS = {
  ETH: 18,
  RETH: 18,
  RPL: 18,
} as const;

/**
 * rETH contract ABI (minimal for common operations)
 */
export const RETH_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function getExchangeRate() view returns (uint256)',
  'function getRethValue(uint256 ethAmount) view returns (uint256)',
  'function getEthValue(uint256 rethAmount) view returns (uint256)',
  'function getBurnEnabled() view returns (bool)',
  'function getCollateralRate() view returns (uint256)',
  'function getTotalCollateral() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function burn(uint256 rethAmount)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

/**
 * RPL token contract ABI
 */
export const RPL_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

/**
 * Rocket Deposit Pool ABI
 */
export const DEPOSIT_POOL_ABI = [
  'function deposit() payable',
  'function getBalance() view returns (uint256)',
  'function getExcessBalance() view returns (uint256)',
  'function getUserLastDepositBlock(address user) view returns (uint256)',
  'function getMaximumDepositAmount() view returns (uint256)',
];

/**
 * Rocket Node Manager ABI
 */
export const NODE_MANAGER_ABI = [
  'function getNodeExists(address nodeAddress) view returns (bool)',
  'function getNodeCount() view returns (uint256)',
  'function getNodeAt(uint256 index) view returns (address)',
  'function getNodeTimezoneLocation(address nodeAddress) view returns (string)',
  'function getNodeWithdrawalAddress(address nodeAddress) view returns (address)',
  'function getNodePendingWithdrawalAddress(address nodeAddress) view returns (address)',
  'function getNodeRPLWithdrawalAddress(address nodeAddress) view returns (address)',
  'function getNodeRPLWithdrawalAddressIsSet(address nodeAddress) view returns (bool)',
  'function getSmoothingPoolRegistrationState(address nodeAddress) view returns (bool)',
  'function getSmoothingPoolRegistrationChanged(address nodeAddress) view returns (uint256)',
  'function registerNode(string timezoneLocation)',
  'function setWithdrawalAddress(address nodeAddress, address newWithdrawalAddress, bool confirm)',
  'function confirmWithdrawalAddress(address nodeAddress)',
  'function setRPLWithdrawalAddress(address nodeAddress, address newRPLWithdrawalAddress, bool confirm)',
  'function setSmoothingPoolRegistrationState(bool state)',
];

/**
 * Rocket Node Staking ABI
 */
export const NODE_STAKING_ABI = [
  'function getNodeRPLStake(address nodeAddress) view returns (uint256)',
  'function getNodeEffectiveRPLStake(address nodeAddress) view returns (uint256)',
  'function getNodeMinimumRPLStake(address nodeAddress) view returns (uint256)',
  'function getNodeMaximumRPLStake(address nodeAddress) view returns (uint256)',
  'function getNodeRPLStakedTime(address nodeAddress) view returns (uint256)',
  'function getTotalRPLStake() view returns (uint256)',
  'function stakeRPL(uint256 amount)',
  'function withdrawRPL(uint256 amount)',
];

/**
 * Rocket Minipool Manager ABI
 */
export const MINIPOOL_MANAGER_ABI = [
  'function getMinipoolExists(address minipool) view returns (bool)',
  'function getMinipoolCount() view returns (uint256)',
  'function getMinipoolAt(uint256 index) view returns (address)',
  'function getNodeMinipoolCount(address nodeAddress) view returns (uint256)',
  'function getNodeMinipoolAt(address nodeAddress, uint256 index) view returns (address)',
  'function getMinipoolByPubkey(bytes pubkey) view returns (address)',
  'function getMinipoolPubkey(address minipool) view returns (bytes)',
  'function getMinipoolWithdrawalCredentials(address minipool) view returns (bytes)',
  'function getMinipoolDestroyed(address minipool) view returns (bool)',
];

/**
 * Minipool contract ABI
 */
export const MINIPOOL_ABI = [
  'function getStatus() view returns (uint8)',
  'function getStatusBlock() view returns (uint256)',
  'function getStatusTime() view returns (uint256)',
  'function getFinalised() view returns (bool)',
  'function getNodeAddress() view returns (address)',
  'function getNodeFee() view returns (uint256)',
  'function getNodeDepositBalance() view returns (uint256)',
  'function getNodeRefundBalance() view returns (uint256)',
  'function getNodeDepositAssigned() view returns (bool)',
  'function getUserDepositBalance() view returns (uint256)',
  'function getUserDepositAssigned() view returns (bool)',
  'function getUserDepositAssignedTime() view returns (uint256)',
  'function getVacant() view returns (bool)',
  'function getPreLaunchValue() view returns (uint256)',
  'function dissolve()',
  'function close()',
  'function stake(bytes validatorSignature, bytes32 depositDataRoot)',
  'function distributeBalance(bool rewardsOnly)',
  'function refund()',
];

/**
 * Rocket Network Prices ABI
 */
export const NETWORK_PRICES_ABI = [
  'function getRPLPrice() view returns (uint256)',
  'function getPricesBlock() view returns (uint256)',
];

/**
 * Rocket Rewards Pool ABI
 */
export const REWARDS_POOL_ABI = [
  'function getClaimingContractAllowance(string contractName) view returns (uint256)',
  'function getClaimingContractPerc(string contractName) view returns (uint256)',
  'function getClaimingContractTotalClaimed(string contractName) view returns (uint256)',
  'function getClaimIntervalsPassed() view returns (uint256)',
  'function getClaimIntervalTime() view returns (uint256)',
  'function getClaimIntervalTimeStart() view returns (uint256)',
  'function getPendingRPLRewards() view returns (uint256)',
  'function getRewardIndex() view returns (uint256)',
];

/**
 * Rocket DAO Protocol ABI
 */
export const DAO_PROTOCOL_ABI = [
  'function getProposalCount() view returns (uint256)',
  'function getProposal(uint256 proposalId) view returns (tuple(address proposer, uint256 createdTime, uint256 startTime, uint256 endTime, uint256 expiryTime, uint256 votesRequired, uint256 votesFor, uint256 votesAgainst, bool cancelled, bool executed, bytes payload))',
  'function getProposalState(uint256 proposalId) view returns (uint8)',
  'function vote(uint256 proposalId, bool support)',
  'function getMemberCount() view returns (uint256)',
  'function getMemberAt(uint256 index) view returns (address)',
];

/**
 * Rocket Auction Manager ABI
 */
export const AUCTION_MANAGER_ABI = [
  'function getLotCount() view returns (uint256)',
  'function getLotExists(uint256 lotIndex) view returns (bool)',
  'function getLotStartBlock(uint256 lotIndex) view returns (uint256)',
  'function getLotEndBlock(uint256 lotIndex) view returns (uint256)',
  'function getLotStartPrice(uint256 lotIndex) view returns (uint256)',
  'function getLotReservePrice(uint256 lotIndex) view returns (uint256)',
  'function getLotTotalRPLAmount(uint256 lotIndex) view returns (uint256)',
  'function getLotTotalBidAmount(uint256 lotIndex) view returns (uint256)',
  'function getLotRPLRecovered(uint256 lotIndex) view returns (bool)',
  'function getLotPriceByTotalBids(uint256 lotIndex) view returns (uint256)',
  'function getLotCurrentPrice(uint256 lotIndex) view returns (uint256)',
  'function getLotClaimedRPLAmount(uint256 lotIndex) view returns (uint256)',
  'function getLotRemainingRPLAmount(uint256 lotIndex) view returns (uint256)',
  'function getLotPriceAtBlock(uint256 lotIndex, uint256 block) view returns (uint256)',
  'function createLot()',
  'function placeBid(uint256 lotIndex) payable',
  'function claimBid(uint256 lotIndex)',
  'function recoverUnclaimedRPL(uint256 lotIndex)',
];

/**
 * Rocket Smoothing Pool ABI
 */
export const SMOOTHING_POOL_ABI = [
  'function getBalance() view returns (uint256)',
];

/**
 * Rocket Merkle Distributor ABI
 */
export const MERKLE_DISTRIBUTOR_ABI = [
  'function isClaimed(uint256 rewardIndex, address claimer) view returns (bool)',
  'function claim(address nodeAddress, uint256[] rewardIndex, uint256[] amountRPL, uint256[] amountETH, bytes32[][] merkleProof)',
];

/**
 * Get contract address for a specific network and contract name
 */
export function getContractAddress(network: string, contractName: string): string {
  const networkContracts = CONTRACT_ADDRESSES[network];
  if (!networkContracts) {
    throw new Error(`Unknown network: ${network}`);
  }
  const address = networkContracts[contractName];
  if (!address) {
    throw new Error(`Unknown contract: ${contractName} on ${network}`);
  }
  return address;
}

/**
 * Get all contract addresses for a network
 */
export function getNetworkContracts(network: string): Record<string, string> {
  const contracts = CONTRACT_ADDRESSES[network];
  if (!contracts) {
    throw new Error(`Unknown network: ${network}`);
  }
  return { ...contracts };
}
