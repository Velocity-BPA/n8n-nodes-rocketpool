/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { GraphQLClient, gql } from 'graphql-request';
import type { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { NETWORKS } from '../constants/networks';

/**
 * Subgraph client for querying indexed Rocket Pool data
 *
 * The Graph protocol indexes blockchain events and provides a GraphQL API
 * for efficient querying of historical and aggregated data.
 */

/**
 * Subgraph node entity
 */
export interface SubgraphNode {
  id: string;
  address: string;
  timezone: string;
  rplStaked: string;
  effectiveRplStaked: string;
  minipoolCount: number;
  smoothingPoolOptIn: boolean;
  createdAt: string;
}

/**
 * Subgraph minipool entity
 */
export interface SubgraphMinipool {
  id: string;
  address: string;
  node: {
    id: string;
    address: string;
  };
  status: number;
  depositType: number;
  nodeFee: string;
  nodeDepositBalance: string;
  userDepositBalance: string;
  createdAt: string;
  stakedAt?: string;
}

/**
 * Subgraph staker entity
 */
export interface SubgraphStaker {
  id: string;
  address: string;
  rethBalance: string;
  totalStaked: string;
  lastStakeAt: string;
}

/**
 * Subgraph reward claim entity
 */
export interface SubgraphRewardClaim {
  id: string;
  node: {
    id: string;
    address: string;
  };
  rewardIndex: number;
  amountRPL: string;
  amountETH: string;
  claimedAt: string;
  transactionHash: string;
}

/**
 * Subgraph auction entity
 */
export interface SubgraphAuction {
  id: string;
  lotIndex: number;
  startBlock: string;
  endBlock: string;
  startPrice: string;
  reservePrice: string;
  totalRPL: string;
  totalBidAmount: string;
  isCleared: boolean;
}

/**
 * Subgraph client configuration
 */
export interface SubgraphClientConfig {
  url: string;
  apiKey?: string;
}

/**
 * Subgraph GraphQL client
 */
export class SubgraphClient {
  private client: GraphQLClient;

  constructor(config: SubgraphClientConfig) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    this.client = new GraphQLClient(config.url, { headers });
  }

  /**
   * Execute custom GraphQL query
   */
  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return this.client.request<T>(query, variables);
  }

  /**
   * Get node by address
   */
  async getNode(address: string): Promise<SubgraphNode | null> {
    const query = gql`
      query GetNode($address: String!) {
        node(id: $address) {
          id
          address
          timezone
          rplStaked
          effectiveRplStaked
          minipoolCount
          smoothingPoolOptIn
          createdAt
        }
      }
    `;

    const result = await this.query<{ node: SubgraphNode | null }>(query, {
      address: address.toLowerCase(),
    });
    return result.node;
  }

  /**
   * Get nodes with pagination
   */
  async getNodes(
    first: number = 100,
    skip: number = 0,
    orderBy: string = 'createdAt',
    orderDirection: string = 'desc',
  ): Promise<SubgraphNode[]> {
    const query = gql`
      query GetNodes($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
        nodes(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
        ) {
          id
          address
          timezone
          rplStaked
          effectiveRplStaked
          minipoolCount
          smoothingPoolOptIn
          createdAt
        }
      }
    `;

    const result = await this.query<{ nodes: SubgraphNode[] }>(query, {
      first,
      skip,
      orderBy,
      orderDirection,
    });
    return result.nodes;
  }

  /**
   * Get minipool by address
   */
  async getMinipool(address: string): Promise<SubgraphMinipool | null> {
    const query = gql`
      query GetMinipool($address: String!) {
        minipool(id: $address) {
          id
          address
          node {
            id
            address
          }
          status
          depositType
          nodeFee
          nodeDepositBalance
          userDepositBalance
          createdAt
          stakedAt
        }
      }
    `;

    const result = await this.query<{ minipool: SubgraphMinipool | null }>(query, {
      address: address.toLowerCase(),
    });
    return result.minipool;
  }

  /**
   * Get minipools with pagination
   */
  async getMinipools(
    first: number = 100,
    skip: number = 0,
    where?: Record<string, unknown>,
    orderBy: string = 'createdAt',
    orderDirection: string = 'desc',
  ): Promise<SubgraphMinipool[]> {
    const query = gql`
      query GetMinipools(
        $first: Int!
        $skip: Int!
        $where: Minipool_filter
        $orderBy: String!
        $orderDirection: String!
      ) {
        minipools(
          first: $first
          skip: $skip
          where: $where
          orderBy: $orderBy
          orderDirection: $orderDirection
        ) {
          id
          address
          node {
            id
            address
          }
          status
          depositType
          nodeFee
          nodeDepositBalance
          userDepositBalance
          createdAt
          stakedAt
        }
      }
    `;

    const result = await this.query<{ minipools: SubgraphMinipool[] }>(query, {
      first,
      skip,
      where,
      orderBy,
      orderDirection,
    });
    return result.minipools;
  }

  /**
   * Get staker by address
   */
  async getStaker(address: string): Promise<SubgraphStaker | null> {
    const query = gql`
      query GetStaker($address: String!) {
        staker(id: $address) {
          id
          address
          rethBalance
          totalStaked
          lastStakeAt
        }
      }
    `;

    const result = await this.query<{ staker: SubgraphStaker | null }>(query, {
      address: address.toLowerCase(),
    });
    return result.staker;
  }

  /**
   * Get stakers with pagination
   */
  async getStakers(
    first: number = 100,
    skip: number = 0,
    orderBy: string = 'totalStaked',
    orderDirection: string = 'desc',
  ): Promise<SubgraphStaker[]> {
    const query = gql`
      query GetStakers($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
        stakers(
          first: $first
          skip: $skip
          orderBy: $orderBy
          orderDirection: $orderDirection
        ) {
          id
          address
          rethBalance
          totalStaked
          lastStakeAt
        }
      }
    `;

    const result = await this.query<{ stakers: SubgraphStaker[] }>(query, {
      first,
      skip,
      orderBy,
      orderDirection,
    });
    return result.stakers;
  }

  /**
   * Get reward claims for a node
   */
  async getNodeRewardClaims(nodeAddress: string): Promise<SubgraphRewardClaim[]> {
    const query = gql`
      query GetNodeRewardClaims($nodeAddress: String!) {
        rewardClaims(where: { node: $nodeAddress }, orderBy: rewardIndex, orderDirection: desc) {
          id
          node {
            id
            address
          }
          rewardIndex
          amountRPL
          amountETH
          claimedAt
          transactionHash
        }
      }
    `;

    const result = await this.query<{ rewardClaims: SubgraphRewardClaim[] }>(query, {
      nodeAddress: nodeAddress.toLowerCase(),
    });
    return result.rewardClaims;
  }

  /**
   * Get auctions
   */
  async getAuctions(
    first: number = 100,
    skip: number = 0,
    activeOnly: boolean = false,
  ): Promise<SubgraphAuction[]> {
    const query = gql`
      query GetAuctions($first: Int!, $skip: Int!, $where: Auction_filter) {
        auctions(first: $first, skip: $skip, where: $where, orderBy: lotIndex, orderDirection: desc) {
          id
          lotIndex
          startBlock
          endBlock
          startPrice
          reservePrice
          totalRPL
          totalBidAmount
          isCleared
        }
      }
    `;

    const where = activeOnly ? { isCleared: false } : undefined;

    const result = await this.query<{ auctions: SubgraphAuction[] }>(query, {
      first,
      skip,
      where,
    });
    return result.auctions;
  }

  /**
   * Get protocol stats
   */
  async getProtocolStats(): Promise<{
    totalNodes: number;
    totalMinipools: number;
    totalRplStaked: string;
    totalEthStaked: string;
    rethSupply: string;
  }> {
    const query = gql`
      query GetProtocolStats {
        protocolStats(id: "1") {
          totalNodes
          totalMinipools
          totalRplStaked
          totalEthStaked
          rethSupply
        }
      }
    `;

    const result = await this.query<{
      protocolStats: {
        totalNodes: number;
        totalMinipools: number;
        totalRplStaked: string;
        totalEthStaked: string;
        rethSupply: string;
      };
    }>(query);
    return result.protocolStats;
  }

  /**
   * Get subgraph health/indexing status
   */
  async getIndexingStatus(): Promise<{
    synced: boolean;
    health: string;
    chains: Array<{
      network: string;
      latestBlock: number;
      chainHeadBlock: number;
    }>;
  }> {
    // This query goes to the Graph Node's indexing status endpoint
    const query = gql`
      query GetIndexingStatus {
        indexingStatuses {
          synced
          health
          chains {
            network
            latestBlock {
              number
            }
            chainHeadBlock {
              number
            }
          }
        }
      }
    `;

    try {
      const result = await this.query<{
        indexingStatuses: Array<{
          synced: boolean;
          health: string;
          chains: Array<{
            network: string;
            latestBlock: { number: number };
            chainHeadBlock: { number: number };
          }>;
        }>;
      }>(query);

      const status = result.indexingStatuses[0];
      return {
        synced: status.synced,
        health: status.health,
        chains: status.chains.map((c) => ({
          network: c.network,
          latestBlock: c.latestBlock.number,
          chainHeadBlock: c.chainHeadBlock.number,
        })),
      };
    } catch {
      return {
        synced: true,
        health: 'unknown',
        chains: [],
      };
    }
  }

  /**
   * Search nodes by criteria
   */
  async searchNodes(
    minRplStake?: string,
    smoothingPoolOnly?: boolean,
    first: number = 100,
  ): Promise<SubgraphNode[]> {
    const conditions: string[] = [];

    if (minRplStake) {
      conditions.push(`rplStaked_gte: "${minRplStake}"`);
    }

    if (smoothingPoolOnly) {
      conditions.push('smoothingPoolOptIn: true');
    }

    const whereClause = conditions.length > 0 ? `where: { ${conditions.join(', ')} }` : '';

    const query = gql`
      query SearchNodes($first: Int!) {
        nodes(first: $first, ${whereClause}, orderBy: rplStaked, orderDirection: desc) {
          id
          address
          timezone
          rplStaked
          effectiveRplStaked
          minipoolCount
          smoothingPoolOptIn
          createdAt
        }
      }
    `;

    const result = await this.query<{ nodes: SubgraphNode[] }>(query, { first });
    return result.nodes;
  }
}

/**
 * Create Subgraph client from n8n credentials
 */
export async function createSubgraphClient(
  context: IExecuteFunctions | ILoadOptionsFunctions,
  credentialType: string = 'rocketPoolApi',
): Promise<SubgraphClient | null> {
  const credentials = await context.getCredentials(credentialType);

  let url = credentials.subgraphUrl as string;

  if (!url) {
    // Try to get from network credentials
    try {
      const networkCredentials = await context.getCredentials('rocketPoolNetwork');
      url = networkCredentials.subgraphUrl as string;
    } catch {
      // No network credentials or subgraph URL
    }
  }

  if (!url) {
    return null;
  }

  return new SubgraphClient({
    url,
    apiKey: credentials.graphApiKey as string | undefined,
  });
}

/**
 * Common GraphQL fragments
 */
export const GraphQLFragments = {
  NODE_FIELDS: `
    id
    address
    timezone
    rplStaked
    effectiveRplStaked
    minipoolCount
    smoothingPoolOptIn
    createdAt
  `,

  MINIPOOL_FIELDS: `
    id
    address
    node {
      id
      address
    }
    status
    depositType
    nodeFee
    nodeDepositBalance
    userDepositBalance
    createdAt
    stakedAt
  `,

  STAKER_FIELDS: `
    id
    address
    rethBalance
    totalStaked
    lastStakeAt
  `,
};
