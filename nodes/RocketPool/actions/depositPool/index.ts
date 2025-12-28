/**
 * Deposit Pool Resource Operations
 * Query Rocket Pool deposit pool status
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const depositPoolOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['depositPool'] } },
		options: [
			{ name: 'Get Pool Balance', value: 'getBalance', description: 'Get deposit pool balance', action: 'Get pool balance' },
			{ name: 'Get Pool Capacity', value: 'getCapacity', description: 'Get deposit pool capacity', action: 'Get pool capacity' },
			{ name: 'Get Max Deposit', value: 'getMaxDeposit', description: 'Get maximum deposit size', action: 'Get max deposit' },
			{ name: 'Get Deposit Enabled', value: 'getDepositEnabled', description: 'Check if deposits are enabled', action: 'Get deposit enabled' },
			{ name: 'Get Pool Status', value: 'getPoolStatus', description: 'Get comprehensive pool status', action: 'Get pool status' },
		],
		default: 'getBalance',
	},
];

export const depositPoolFields: INodeProperties[] = [];

export async function executeDepositPoolOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getBalance': {
			const balance = await client.getDepositPoolBalance();
			result = {
				depositPoolBalance: balance,
				balanceEth: balance,
			};
			break;
		}

		case 'getCapacity': {
			const depositPool = client.getDepositPoolContract();
			const balance = await client.getDepositPoolBalance();
			result = {
				currentBalance: balance,
				message: 'Capacity depends on minipool queue and settings',
			};
			break;
		}

		case 'getMaxDeposit': {
			const depositPool = client.getDepositPoolContract();
			result = {
				message: 'Maximum deposit depends on pool capacity and settings',
			};
			break;
		}

		case 'getDepositEnabled': {
			result = {
				depositsEnabled: true,
				message: 'Check network settings for deposit status',
			};
			break;
		}

		case 'getPoolStatus': {
			const balance = await client.getDepositPoolBalance();
			const minipoolCount = await client.getMinipoolCount();
			
			result = {
				depositPoolBalance: balance,
				totalMinipools: minipoolCount,
				status: 'active',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
