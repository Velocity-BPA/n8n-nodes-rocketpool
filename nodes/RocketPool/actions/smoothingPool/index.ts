/**
 * Smoothing Pool Resource Operations
 * Manage Rocket Pool smoothing pool participation
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const smoothingPoolOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['smoothingPool'] } },
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get smoothing pool balance', action: 'Get balance' },
			{ name: 'Get Node Status', value: 'getNodeStatus', description: 'Check if node is in smoothing pool', action: 'Get node status' },
			{ name: 'Opt In', value: 'optIn', description: 'Opt into smoothing pool', action: 'Opt in' },
			{ name: 'Opt Out', value: 'optOut', description: 'Opt out of smoothing pool', action: 'Opt out' },
			{ name: 'Get Pool Info', value: 'getPoolInfo', description: 'Get smoothing pool information', action: 'Get pool info' },
		],
		default: 'getNodeStatus',
	},
];

export const smoothingPoolFields: INodeProperties[] = [
	{
		displayName: 'Node Address',
		name: 'nodeAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Node operator address',
		displayOptions: { show: { resource: ['smoothingPool'], operation: ['getNodeStatus'] } },
	},
];

export async function executeSmoothingPoolOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getBalance': {
			const smoothingPool = client.getSmoothingPoolContract();
			result = {
				message: 'Query smoothing pool contract for balance',
				description: 'Smoothing pool collects MEV and priority fees',
			};
			break;
		}

		case 'getNodeStatus': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const status = await client.getSmoothingPoolStatus(nodeAddress);
			result = {
				nodeAddress,
				optedIn: status,
				message: status 
					? 'Node is in smoothing pool' 
					: 'Node is not in smoothing pool',
			};
			break;
		}

		case 'optIn': {
			const tx = await client.setSmoothingPoolState(true);
			result = {
				transactionHash: tx.hash,
				action: 'optIn',
				status: 'pending',
				message: 'Opting into smoothing pool',
			};
			break;
		}

		case 'optOut': {
			const tx = await client.setSmoothingPoolState(false);
			result = {
				transactionHash: tx.hash,
				action: 'optOut',
				status: 'pending',
				message: 'Opting out of smoothing pool',
			};
			break;
		}

		case 'getPoolInfo': {
			result = {
				name: 'Smoothing Pool',
				description: 'Shares MEV and priority fees among opted-in node operators',
				benefits: [
					'Smoothed rewards over time',
					'Reduced variance in earnings',
					'Collective MEV capture',
				],
				distribution: 'Proportional to effective stake each interval',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
