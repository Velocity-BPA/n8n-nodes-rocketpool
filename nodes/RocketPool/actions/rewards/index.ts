/**
 * Rewards Resource Operations
 * Manage Rocket Pool rewards and claims
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { createSubgraphClient } from '../../transport/subgraphClient';
import { fetchRewardSnapshot, formatClaimParams, calculateTotalRewards } from '../../utils/rewardUtils';
import { REWARD_INTERVAL_DURATION, IPFS_GATEWAYS } from '../../constants/rewardIntervals';

export const rewardsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['rewards'] } },
		options: [
			{ name: 'Get Claimable Rewards', value: 'getClaimable', description: 'Get claimable rewards for node', action: 'Get claimable rewards' },
			{ name: 'Claim Rewards', value: 'claimRewards', description: 'Claim pending rewards', action: 'Claim rewards' },
			{ name: 'Get Reward Intervals', value: 'getIntervals', description: 'Get reward interval info', action: 'Get reward intervals' },
			{ name: 'Get Reward Snapshot', value: 'getSnapshot', description: 'Get rewards snapshot from IPFS', action: 'Get reward snapshot' },
			{ name: 'Get Node Reward Claims', value: 'getNodeClaims', description: 'Get reward claims for node', action: 'Get node reward claims' },
			{ name: 'Check Claimed Status', value: 'checkClaimed', description: 'Check if rewards are claimed', action: 'Check claimed status' },
			{ name: 'Get Unclaimed Intervals', value: 'getUnclaimed', description: 'Get unclaimed reward intervals', action: 'Get unclaimed intervals' },
			{ name: 'Get Smoothing Pool Rewards', value: 'getSmoothingPoolRewards', description: 'Get smoothing pool rewards', action: 'Get smoothing pool rewards' },
		],
		default: 'getClaimable',
	},
];

export const rewardsFields: INodeProperties[] = [
	{
		displayName: 'Node Address',
		name: 'nodeAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Node operator address',
		displayOptions: { show: { resource: ['rewards'], operation: ['getClaimable', 'getNodeClaims', 'checkClaimed', 'getUnclaimed', 'getSmoothingPoolRewards'] } },
	},
	{
		displayName: 'Interval Index',
		name: 'intervalIndex',
		type: 'number',
		required: true,
		default: 0,
		description: 'Reward interval index',
		displayOptions: { show: { resource: ['rewards'], operation: ['getSnapshot', 'checkClaimed'] } },
	},
	{
		displayName: 'Claim Intervals',
		name: 'claimIntervals',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1,2,3',
		description: 'Comma-separated list of interval indices to claim',
		displayOptions: { show: { resource: ['rewards'], operation: ['claimRewards'] } },
	},
];

export async function executeRewardsOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const apiCredentials = await this.getCredentials('rocketPoolApi').catch(() => null);
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getClaimable': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const rewardsPool = client.getRewardsPoolContract();
			const merkleDistributor = client.getMerkleDistributorContract();
			
			result = {
				nodeAddress,
				message: 'Query merkle rewards for detailed claimable amounts',
				intervalDuration: `${REWARD_INTERVAL_DURATION / (24 * 60 * 60)} days`,
			};
			break;
		}

		case 'claimRewards': {
			const claimIntervals = this.getNodeParameter('claimIntervals', index) as string;
			const intervals = claimIntervals.split(',').map(i => parseInt(i.trim()));
			
			const merkleProofs: string[][] = [];
			const rplAmounts: string[] = [];
			const ethAmounts: string[] = [];
			
			const tx = await client.claimRewards(intervals, merkleProofs, rplAmounts, ethAmounts);
			result = {
				transactionHash: tx.hash,
				intervals,
				status: 'pending',
				message: 'Reward claim submitted',
			};
			break;
		}

		case 'getIntervals': {
			const rewardsPool = client.getRewardsPoolContract();
			const intervalDurationDays = REWARD_INTERVAL_DURATION / (24 * 60 * 60);
			
			result = {
				intervalDuration: REWARD_INTERVAL_DURATION,
				intervalDurationDays,
				ipfsGateways: IPFS_GATEWAYS,
			};
			break;
		}

		case 'getSnapshot': {
			const intervalIndex = this.getNodeParameter('intervalIndex', index) as number;
			
			try {
				const snapshot = await fetchRewardSnapshot(intervalIndex.toString(), IPFS_GATEWAYS);
				result = {
					intervalIndex,
					found: true,
					nodeCount: Object.keys(snapshot.nodeRewards || {}).length,
				};
			} catch {
				result = {
					intervalIndex,
					found: false,
					message: 'Snapshot not found or not yet available',
				};
			}
			break;
		}

		case 'getNodeClaims': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			
			if (apiCredentials) {
				const subgraphClient = createSubgraphClient(apiCredentials);
				const claims = await subgraphClient.getNodeRewardClaims(nodeAddress.toLowerCase());
				result = {
					nodeAddress,
					claims: claims.map(c => ({
						interval: c.rewardIndex,
						rplAmount: c.rplAmount,
						ethAmount: c.ethAmount,
						timestamp: c.timestamp,
					})),
					totalClaims: claims.length,
				};
			} else {
				result = {
					nodeAddress,
					message: 'Subgraph credentials required for claim history',
				};
			}
			break;
		}

		case 'checkClaimed': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const intervalIndex = this.getNodeParameter('intervalIndex', index) as number;
			const claimed = await client.isRewardClaimed(nodeAddress, intervalIndex);
			result = {
				nodeAddress,
				intervalIndex,
				claimed,
				message: claimed ? 'Rewards already claimed' : 'Rewards not yet claimed',
			};
			break;
		}

		case 'getUnclaimed': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const unclaimed: number[] = [];
			
			for (let i = 0; i < 100; i++) {
				try {
					const claimed = await client.isRewardClaimed(nodeAddress, i);
					if (!claimed) {
						unclaimed.push(i);
					}
				} catch {
					break;
				}
			}
			
			result = {
				nodeAddress,
				unclaimedIntervals: unclaimed,
				count: unclaimed.length,
			};
			break;
		}

		case 'getSmoothingPoolRewards': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const smoothingPool = client.getSmoothingPoolContract();
			const isOptedIn = await client.getSmoothingPoolStatus(nodeAddress);
			
			result = {
				nodeAddress,
				optedIn: isOptedIn,
				message: isOptedIn 
					? 'Node is in smoothing pool, rewards distributed each interval'
					: 'Node is not in smoothing pool',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
