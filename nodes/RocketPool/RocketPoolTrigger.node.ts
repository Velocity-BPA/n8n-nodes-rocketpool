/**
 * Rocket Pool Trigger Node
 * Event monitoring for Rocket Pool protocol
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 *
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import type {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
} from 'n8n-workflow';

import { createRocketPoolClient } from './transport/rocketPoolClient';
import { CONTRACT_ADDRESSES } from './constants';

// Log licensing notice once on module load
let licenseLogged = false;
function logLicenseNotice(): void {
	if (!licenseLogged) {
		console.warn(`[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
		licenseLogged = true;
	}
}

export class RocketPoolTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rocket Pool Trigger',
		name: 'rocketPoolTrigger',
		icon: 'file:rocketpool.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Monitor Rocket Pool protocol events',
		defaults: {
			name: 'Rocket Pool Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'rocketPoolNetwork',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Event Category',
				name: 'eventCategory',
				type: 'options',
				options: [
					{ name: 'Staking', value: 'staking' },
					{ name: 'rETH', value: 'reth' },
					{ name: 'Node Operator', value: 'node' },
					{ name: 'Minipool', value: 'minipool' },
					{ name: 'RPL', value: 'rpl' },
					{ name: 'Rewards', value: 'rewards' },
					{ name: 'DAO', value: 'dao' },
					{ name: 'Auction', value: 'auction' },
				],
				default: 'staking',
				description: 'Category of event to monitor',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['staking'] } },
				options: [
					{ name: 'ETH Staked', value: 'ethStaked' },
					{ name: 'rETH Burned', value: 'rethBurned' },
					{ name: 'Exchange Rate Changed', value: 'rateChanged' },
					{ name: 'Large Stake Alert', value: 'largeStake' },
				],
				default: 'ethStaked',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['reth'] } },
				options: [
					{ name: 'rETH Minted', value: 'rethMinted' },
					{ name: 'rETH Burned', value: 'rethBurned' },
					{ name: 'rETH Transfer', value: 'rethTransfer' },
					{ name: 'Collateral Rate Changed', value: 'collateralChanged' },
				],
				default: 'rethMinted',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['node'] } },
				options: [
					{ name: 'Node Registered', value: 'nodeRegistered' },
					{ name: 'Withdrawal Address Set', value: 'withdrawalSet' },
					{ name: 'Smoothing Pool Changed', value: 'smoothingPoolChanged' },
				],
				default: 'nodeRegistered',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['minipool'] } },
				options: [
					{ name: 'Minipool Created', value: 'minipoolCreated' },
					{ name: 'Minipool Staked', value: 'minipoolStaked' },
					{ name: 'Minipool Dissolved', value: 'minipoolDissolved' },
					{ name: 'Minipool Closed', value: 'minipoolClosed' },
					{ name: 'Balance Distributed', value: 'balanceDistributed' },
					{ name: 'Status Changed', value: 'statusChanged' },
				],
				default: 'minipoolCreated',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['rpl'] } },
				options: [
					{ name: 'RPL Staked', value: 'rplStaked' },
					{ name: 'RPL Unstaked', value: 'rplUnstaked' },
					{ name: 'RPL Slashed', value: 'rplSlashed' },
					{ name: 'RPL Price Updated', value: 'rplPriceUpdated' },
				],
				default: 'rplStaked',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['rewards'] } },
				options: [
					{ name: 'Rewards Available', value: 'rewardsAvailable' },
					{ name: 'Rewards Claimed', value: 'rewardsClaimed' },
					{ name: 'New Reward Interval', value: 'newInterval' },
					{ name: 'Merkle Root Submitted', value: 'merkleRootSubmitted' },
				],
				default: 'rewardsAvailable',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['dao'] } },
				options: [
					{ name: 'Proposal Created', value: 'proposalCreated' },
					{ name: 'Vote Cast', value: 'voteCast' },
					{ name: 'Proposal Executed', value: 'proposalExecuted' },
					{ name: 'Settings Changed', value: 'settingsChanged' },
				],
				default: 'proposalCreated',
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				displayOptions: { show: { eventCategory: ['auction'] } },
				options: [
					{ name: 'Auction Started', value: 'auctionStarted' },
					{ name: 'Bid Placed', value: 'bidPlaced' },
					{ name: 'Lot Claimed', value: 'lotClaimed' },
				],
				default: 'auctionStarted',
			},
			{
				displayName: 'Threshold (ETH)',
				name: 'threshold',
				type: 'number',
				default: 100,
				description: 'Minimum amount for alert',
				displayOptions: { show: { event: ['largeStake'] } },
			},
			{
				displayName: 'Node Address',
				name: 'nodeAddress',
				type: 'string',
				default: '',
				placeholder: '0x... (leave empty for all nodes)',
				description: 'Filter events for specific node',
				displayOptions: { show: { eventCategory: ['node', 'minipool', 'rewards'] } },
			},
			{
				displayName: 'Poll Interval',
				name: 'pollInterval',
				type: 'number',
				default: 60,
				description: 'How often to check for new events (seconds)',
			},
		],
	};

	async poll(this: ITriggerFunctions): Promise<ITriggerResponse> {
		logLicenseNotice();

		const eventCategory = this.getNodeParameter('eventCategory') as string;
		const event = this.getNodeParameter('event') as string;
		const pollInterval = this.getNodeParameter('pollInterval') as number;
		const credentials = await this.getCredentials('rocketPoolNetwork');
		const client = createRocketPoolClient(credentials);

		// Get last poll data
		const webhookData = this.getWorkflowStaticData('node');
		const lastBlockNumber = webhookData.lastBlockNumber as number || 0;

		try {
			const currentBlock = await client.getBlockNumber();
			
			// Store current block for next poll
			webhookData.lastBlockNumber = currentBlock;

			// Only trigger if we have new blocks
			if (currentBlock <= lastBlockNumber) {
				return { workflowData: [] };
			}

			const events: Array<Record<string, unknown>> = [];

			// Process events based on category and type
			switch (eventCategory) {
				case 'staking': {
					if (event === 'rateChanged') {
						const rate = await client.getRethExchangeRate();
						const lastRate = webhookData.lastRate as string;
						if (lastRate && rate !== lastRate) {
							events.push({
								type: 'exchangeRateChanged',
								previousRate: lastRate,
								newRate: rate,
								blockNumber: currentBlock,
								timestamp: Date.now(),
							});
						}
						webhookData.lastRate = rate;
					}
					break;
				}

				case 'rpl': {
					if (event === 'rplPriceUpdated') {
						const price = await client.getRplPrice();
						const lastPrice = webhookData.lastRplPrice as string;
						if (lastPrice && price !== lastPrice) {
							events.push({
								type: 'rplPriceUpdated',
								previousPrice: lastPrice,
								newPrice: price,
								blockNumber: currentBlock,
								timestamp: Date.now(),
							});
						}
						webhookData.lastRplPrice = price;
					}
					break;
				}

				case 'node': {
					if (event === 'nodeRegistered') {
						const nodeCount = await client.getNodeCount();
						const lastCount = webhookData.lastNodeCount as string;
						if (lastCount && nodeCount !== lastCount) {
							events.push({
								type: 'nodeCountChanged',
								previousCount: lastCount,
								newCount: nodeCount,
								blockNumber: currentBlock,
								timestamp: Date.now(),
							});
						}
						webhookData.lastNodeCount = nodeCount;
					}
					break;
				}

				case 'minipool': {
					if (event === 'minipoolCreated') {
						const minipoolCount = await client.getMinipoolCount();
						const lastCount = webhookData.lastMinipoolCount as string;
						if (lastCount && minipoolCount !== lastCount) {
							events.push({
								type: 'minipoolCountChanged',
								previousCount: lastCount,
								newCount: minipoolCount,
								blockNumber: currentBlock,
								timestamp: Date.now(),
							});
						}
						webhookData.lastMinipoolCount = minipoolCount;
					}
					break;
				}

				default:
					// Generic polling for other events
					events.push({
						type: event,
						category: eventCategory,
						blockNumber: currentBlock,
						fromBlock: lastBlockNumber,
						toBlock: currentBlock,
						timestamp: Date.now(),
						message: `Polling for ${event} events`,
					});
			}

			if (events.length === 0) {
				return { workflowData: [] };
			}

			return {
				workflowData: [events.map(e => ({ json: e }))],
			};

		} catch (error) {
			// Return empty on error to avoid breaking the trigger
			console.error('RocketPool Trigger error:', error);
			return { workflowData: [] };
		}
	}
}
