/**
 * Prices Resource Operations
 * Query Rocket Pool price data
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const pricesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['prices'] } },
		options: [
			{ name: 'Get RPL Price', value: 'getRplPrice', description: 'Get RPL price in ETH', action: 'Get RPL price' },
			{ name: 'Get rETH Rate', value: 'getRethRate', description: 'Get rETH exchange rate', action: 'Get rETH rate' },
			{ name: 'Get All Prices', value: 'getAllPrices', description: 'Get all protocol prices', action: 'Get all prices' },
			{ name: 'Get Price Block', value: 'getPriceBlock', description: 'Get block of last price update', action: 'Get price block' },
		],
		default: 'getRplPrice',
	},
];

export const pricesFields: INodeProperties[] = [];

export async function executePricesOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getRplPrice': {
			const price = await client.getRplPrice();
			result = {
				rplPrice: price,
				unit: 'ETH per RPL',
			};
			break;
		}

		case 'getRethRate': {
			const rate = await client.getRethExchangeRate();
			result = {
				rethExchangeRate: rate,
				unit: 'ETH per rETH',
				description: '1 rETH = ' + rate + ' ETH',
			};
			break;
		}

		case 'getAllPrices': {
			const rplPrice = await client.getRplPrice();
			const rethRate = await client.getRethExchangeRate();
			const blockNumber = await client.getBlockNumber();
			
			result = {
				rplPrice,
				rethExchangeRate: rethRate,
				blockNumber,
				timestamp: Date.now(),
			};
			break;
		}

		case 'getPriceBlock': {
			const networkPrices = client.getNetworkPricesContract();
			const blockNumber = await client.getBlockNumber();
			
			result = {
				currentBlock: blockNumber,
				message: 'Price updates occur approximately every 24 hours',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
