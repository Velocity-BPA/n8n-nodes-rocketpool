/**
 * Inflation Resource Operations
 * Query Rocket Pool RPL inflation data
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const inflationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['inflation'] } },
		options: [
			{ name: 'Get Inflation Rate', value: 'getRate', description: 'Get annual RPL inflation rate', action: 'Get inflation rate' },
			{ name: 'Get RPL Per Day', value: 'getRplPerDay', description: 'Get daily RPL inflation', action: 'Get RPL per day' },
			{ name: 'Get Inflation Info', value: 'getInfo', description: 'Get inflation information', action: 'Get inflation info' },
		],
		default: 'getRate',
	},
];

export const inflationFields: INodeProperties[] = [];

export async function executeInflationOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getRate': {
			result = {
				annualInflationRate: '5%',
				description: 'Annual RPL inflation rate',
			};
			break;
		}

		case 'getRplPerDay': {
			const rplContract = client.getRplContract();
			const totalSupply = await rplContract.totalSupply();
			const totalSupplyEth = client.formatEth(totalSupply);
			const dailyInflation = parseFloat(totalSupplyEth) * 0.05 / 365;
			
			result = {
				totalSupply: totalSupplyEth,
				dailyInflation: dailyInflation.toFixed(2),
				unit: 'RPL',
			};
			break;
		}

		case 'getInfo': {
			result = {
				annualRate: '5%',
				distribution: {
					nodeOperators: '70%',
					protocolDao: '15%',
					oracleDao: '15%',
				},
				description: 'RPL inflation funds protocol rewards',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
