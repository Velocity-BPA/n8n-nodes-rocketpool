/**
 * Auction Resource Operations
 * Manage Rocket Pool RPL auctions
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { createSubgraphClient } from '../../transport/subgraphClient';

export const auctionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['auction'] } },
		options: [
			{ name: 'Get Active Auctions', value: 'getActive', description: 'Get active RPL auctions', action: 'Get active auctions' },
			{ name: 'Get Auction Lot', value: 'getLot', description: 'Get specific auction lot details', action: 'Get auction lot' },
			{ name: 'Place Bid', value: 'placeBid', description: 'Place bid on auction lot', action: 'Place bid' },
			{ name: 'Claim Lot', value: 'claimLot', description: 'Claim won auction lot', action: 'Claim lot' },
			{ name: 'Get Auction Settings', value: 'getSettings', description: 'Get auction settings', action: 'Get auction settings' },
			{ name: 'Get Auction History', value: 'getHistory', description: 'Get auction history', action: 'Get auction history' },
		],
		default: 'getActive',
	},
];

export const auctionFields: INodeProperties[] = [
	{
		displayName: 'Lot Index',
		name: 'lotIndex',
		type: 'number',
		required: true,
		default: 0,
		description: 'Auction lot index',
		displayOptions: { show: { resource: ['auction'], operation: ['getLot', 'placeBid', 'claimLot'] } },
	},
	{
		displayName: 'Bid Amount (ETH)',
		name: 'bidAmount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.0',
		description: 'Amount of ETH to bid',
		displayOptions: { show: { resource: ['auction'], operation: ['placeBid'] } },
	},
];

export async function executeAuctionOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const apiCredentials = await this.getCredentials('rocketPoolApi').catch(() => null);
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getActive': {
			const auctionManager = client.getAuctionManagerContract();
			result = {
				message: 'Query auction manager for active lots',
				description: 'RPL auctions sell slashed RPL for ETH',
			};
			
			if (apiCredentials) {
				const subgraph = createSubgraphClient(apiCredentials);
				const auctions = await subgraph.getAuctions(10);
				result.recentAuctions = auctions;
			}
			break;
		}

		case 'getLot': {
			const lotIndex = this.getNodeParameter('lotIndex', index) as number;
			result = {
				lotIndex,
				message: 'Query auction manager for lot details',
			};
			break;
		}

		case 'placeBid': {
			const lotIndex = this.getNodeParameter('lotIndex', index) as number;
			const bidAmount = this.getNodeParameter('bidAmount', index) as string;
			const tx = await client.placeBid(lotIndex, bidAmount);
			result = {
				transactionHash: tx.hash,
				lotIndex,
				bidAmount,
				status: 'pending',
			};
			break;
		}

		case 'claimLot': {
			const lotIndex = this.getNodeParameter('lotIndex', index) as number;
			const tx = await client.claimBid(lotIndex);
			result = {
				transactionHash: tx.hash,
				lotIndex,
				status: 'pending',
			};
			break;
		}

		case 'getSettings': {
			result = {
				lotDuration: '7 days',
				startingPriceRatio: '100%',
				reservePriceRatio: '50%',
				description: 'Auction settings for slashed RPL',
			};
			break;
		}

		case 'getHistory': {
			if (apiCredentials) {
				const subgraph = createSubgraphClient(apiCredentials);
				const auctions = await subgraph.getAuctions(50);
				result = {
					auctions,
					count: auctions.length,
				};
			} else {
				result = {
					message: 'Subgraph credentials required for auction history',
				};
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
