/**
 * Network Resource Operations
 * Query Rocket Pool network statistics and info
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { createSubgraphClient } from '../../transport/subgraphClient';
import { NETWORKS, CONTRACT_ADDRESSES } from '../../constants';
import { rethToEth, calculateRethApr } from '../../utils/rethUtils';

export const networkOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['network'] } },
		options: [
			{ name: 'Get Network Stats', value: 'getStats', description: 'Get comprehensive network statistics', action: 'Get network stats' },
			{ name: 'Get Node Count', value: 'getNodeCount', description: 'Get total registered node count', action: 'Get node count' },
			{ name: 'Get Minipool Count', value: 'getMinipoolCount', description: 'Get total minipool count', action: 'Get minipool count' },
			{ name: 'Get Total Staked', value: 'getTotalStaked', description: 'Get total ETH staked', action: 'Get total staked' },
			{ name: 'Get rETH APR', value: 'getRethApr', description: 'Get current rETH staking APR', action: 'Get rETH APR' },
			{ name: 'Get Protocol Version', value: 'getVersion', description: 'Get protocol version info', action: 'Get protocol version' },
			{ name: 'Get Contract Addresses', value: 'getContracts', description: 'Get contract addresses for network', action: 'Get contract addresses' },
			{ name: 'Get Network Info', value: 'getNetworkInfo', description: 'Get network configuration', action: 'Get network info' },
		],
		default: 'getStats',
	},
];

export const networkFields: INodeProperties[] = [
	{
		displayName: 'Network',
		name: 'networkSelect',
		type: 'options',
		default: 'mainnet',
		options: [
			{ name: 'Mainnet', value: 'mainnet' },
			{ name: 'Holesky', value: 'holesky' },
		],
		description: 'Network to query',
		displayOptions: { show: { resource: ['network'], operation: ['getContracts', 'getNetworkInfo'] } },
	},
];

export async function executeNetworkOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const apiCredentials = await this.getCredentials('rocketPoolApi').catch(() => null);
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getStats': {
			const nodeCount = await client.getNodeCount();
			const minipoolCount = await client.getMinipoolCount();
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();
			const rate = await client.getRethExchangeRate();
			const depositPoolBalance = await client.getDepositPoolBalance();
			const rplPrice = await client.getRplPrice();

			const totalReth = client.formatEth(totalSupply);
			const totalEthStaked = rethToEth(parseFloat(totalReth), parseFloat(rate));
			const apr = calculateRethApr(1.0, parseFloat(rate), 365);

			result = {
				nodeCount,
				minipoolCount,
				totalRethSupply: totalReth,
				totalEthStaked: totalEthStaked.toString(),
				exchangeRate: rate,
				depositPoolBalance,
				rplPrice,
				stakingApr: `${(apr * 100).toFixed(2)}%`,
			};
			
			if (apiCredentials) {
				const subgraph = createSubgraphClient(apiCredentials);
				const stats = await subgraph.getProtocolStats();
				if (stats) {
					result.tvl = stats.totalValueLockedETH;
					result.stakerCount = stats.stakerCount;
				}
			}
			break;
		}

		case 'getNodeCount': {
			const count = await client.getNodeCount();
			result = {
				nodeCount: count,
			};
			break;
		}

		case 'getMinipoolCount': {
			const count = await client.getMinipoolCount();
			result = {
				minipoolCount: count,
				estimatedValidators: count,
			};
			break;
		}

		case 'getTotalStaked': {
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();
			const rate = await client.getRethExchangeRate();
			const totalReth = client.formatEth(totalSupply);
			const totalEth = rethToEth(parseFloat(totalReth), parseFloat(rate));
			
			result = {
				totalRethSupply: totalReth,
				totalEthStaked: totalEth.toString(),
				exchangeRate: rate,
			};
			break;
		}

		case 'getRethApr': {
			const rate = await client.getRethExchangeRate();
			const apr = calculateRethApr(1.0, parseFloat(rate), 365);
			
			result = {
				apr: apr.toFixed(6),
				aprPercent: `${(apr * 100).toFixed(2)}%`,
				apy: ((Math.pow(1 + apr/365, 365) - 1) * 100).toFixed(2) + '%',
				exchangeRate: rate,
			};
			break;
		}

		case 'getVersion': {
			result = {
				protocol: 'Rocket Pool',
				version: '1.3.x',
				message: 'Query rocketStorage for detailed version info',
			};
			break;
		}

		case 'getContracts': {
			const networkSelect = this.getNodeParameter('networkSelect', index) as string;
			const addresses = CONTRACT_ADDRESSES[networkSelect as keyof typeof CONTRACT_ADDRESSES];
			
			result = {
				network: networkSelect,
				contracts: addresses || {},
			};
			break;
		}

		case 'getNetworkInfo': {
			const networkSelect = this.getNodeParameter('networkSelect', index) as string;
			const networkInfo = NETWORKS[networkSelect as keyof typeof NETWORKS];
			
			result = {
				network: networkSelect,
				...(networkInfo || {}),
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
