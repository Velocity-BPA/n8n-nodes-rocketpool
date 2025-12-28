/**
 * Analytics Resource Operations
 * Query Rocket Pool protocol analytics
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { createSubgraphClient } from '../../transport/subgraphClient';
import { rethToEth, calculateRethApr } from '../../utils/rethUtils';

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['analytics'] } },
		options: [
			{ name: 'Get Protocol TVL', value: 'getTvl', description: 'Get total value locked', action: 'Get protocol TVL' },
			{ name: 'Get Protocol Stats', value: 'getStats', description: 'Get protocol statistics', action: 'Get protocol stats' },
			{ name: 'Get Node Stats', value: 'getNodeStats', description: 'Get node operator statistics', action: 'Get node stats' },
			{ name: 'Get Minipool Stats', value: 'getMinipoolStats', description: 'Get minipool statistics', action: 'Get minipool stats' },
			{ name: 'Get Staking Stats', value: 'getStakingStats', description: 'Get staking statistics', action: 'Get staking stats' },
			{ name: 'Get APR History', value: 'getAprHistory', description: 'Get APR history', action: 'Get APR history' },
		],
		default: 'getTvl',
	},
];

export const analyticsFields: INodeProperties[] = [];

export async function executeAnalyticsOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const apiCredentials = await this.getCredentials('rocketPoolApi').catch(() => null);
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getTvl': {
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();
			const rate = await client.getRethExchangeRate();
			const totalReth = client.formatEth(totalSupply);
			const totalEth = rethToEth(parseFloat(totalReth), parseFloat(rate));
			const rplPrice = await client.getRplPrice();
			
			result = {
				rethTvl: totalEth.toString(),
				totalRethSupply: totalReth,
				exchangeRate: rate,
				rplPriceEth: rplPrice,
			};
			
			if (apiCredentials) {
				const subgraph = createSubgraphClient(apiCredentials);
				const stats = await subgraph.getProtocolStats();
				if (stats) {
					result.tvlFromSubgraph = stats.totalValueLockedETH;
				}
			}
			break;
		}

		case 'getStats': {
			const nodeCount = await client.getNodeCount();
			const minipoolCount = await client.getMinipoolCount();
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();
			const rate = await client.getRethExchangeRate();
			const depositPoolBalance = await client.getDepositPoolBalance();
			
			result = {
				nodeCount,
				minipoolCount,
				totalRethSupply: client.formatEth(totalSupply),
				exchangeRate: rate,
				depositPoolBalance,
			};
			
			if (apiCredentials) {
				const subgraph = createSubgraphClient(apiCredentials);
				const stats = await subgraph.getProtocolStats();
				if (stats) {
					result.stakerCount = stats.stakerCount;
				}
			}
			break;
		}

		case 'getNodeStats': {
			const nodeCount = await client.getNodeCount();
			
			result = {
				totalNodes: nodeCount,
				description: 'Use subgraph for detailed node analytics',
			};
			
			if (apiCredentials) {
				const subgraph = createSubgraphClient(apiCredentials);
				const nodes = await subgraph.getNodes(100);
				const activeNodes = nodes.filter(n => parseInt(n.minipoolCount) > 0);
				result.activeNodes = activeNodes.length;
				result.inactiveNodes = nodes.length - activeNodes.length;
			}
			break;
		}

		case 'getMinipoolStats': {
			const minipoolCount = await client.getMinipoolCount();
			
			result = {
				totalMinipools: minipoolCount,
				estimatedValidators: minipoolCount,
				estimatedEthStaked: (parseInt(minipoolCount) * 32).toString(),
			};
			break;
		}

		case 'getStakingStats': {
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();
			const rate = await client.getRethExchangeRate();
			const totalReth = client.formatEth(totalSupply);
			const totalEth = rethToEth(parseFloat(totalReth), parseFloat(rate));
			const apr = calculateRethApr(1.0, parseFloat(rate), 365);
			
			result = {
				totalRethSupply: totalReth,
				totalEthStaked: totalEth.toString(),
				currentApr: `${(apr * 100).toFixed(2)}%`,
				exchangeRate: rate,
			};
			break;
		}

		case 'getAprHistory': {
			const rate = await client.getRethExchangeRate();
			const currentApr = calculateRethApr(1.0, parseFloat(rate), 365);
			
			result = {
				currentApr: `${(currentApr * 100).toFixed(2)}%`,
				currentRate: rate,
				message: 'Historical APR requires external data sources',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
