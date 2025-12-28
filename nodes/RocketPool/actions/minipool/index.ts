/**
 * Minipool Resource Operations
 * Manage Rocket Pool minipools (validators)
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { MinipoolStatus, MinipoolDepositType, MINIPOOL_STATUS_NAMES, DEPOSIT_TYPE_NAMES } from '../../constants/minipoolTypes';

export const minipoolOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['minipool'] } },
		options: [
			{ name: 'Get Minipool', value: 'getMinipool', description: 'Get minipool details', action: 'Get minipool' },
			{ name: 'List Node Minipools', value: 'listMinipools', description: 'List minipools for a node', action: 'List minipools' },
			{ name: 'Get Status', value: 'getStatus', description: 'Get minipool status', action: 'Get status' },
			{ name: 'Get Balance', value: 'getBalance', description: 'Get minipool balance', action: 'Get balance' },
			{ name: 'Get Node Fee', value: 'getNodeFee', description: 'Get minipool commission fee', action: 'Get node fee' },
			{ name: 'Get Deposit Type', value: 'getDepositType', description: 'Get minipool deposit type', action: 'Get deposit type' },
			{ name: 'Dissolve Minipool', value: 'dissolve', description: 'Dissolve a minipool', action: 'Dissolve minipool' },
			{ name: 'Close Minipool', value: 'close', description: 'Close a minipool', action: 'Close minipool' },
			{ name: 'Distribute Balance', value: 'distributeBalance', description: 'Distribute minipool balance', action: 'Distribute balance' },
			{ name: 'Get Minipool Count', value: 'getMinipoolCount', description: 'Get total minipool count', action: 'Get minipool count' },
			{ name: 'Get Node Minipool Count', value: 'getNodeMinipoolCount', description: 'Get minipool count for node', action: 'Get node minipool count' },
			{ name: 'Get Queue Length', value: 'getQueueLength', description: 'Get minipool queue length', action: 'Get queue length' },
		],
		default: 'getMinipool',
	},
];

export const minipoolFields: INodeProperties[] = [
	{
		displayName: 'Minipool Address',
		name: 'minipoolAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Minipool contract address',
		displayOptions: { show: { resource: ['minipool'], operation: ['getMinipool', 'getStatus', 'getBalance', 'getNodeFee', 'getDepositType', 'dissolve', 'close', 'distributeBalance'] } },
	},
	{
		displayName: 'Node Address',
		name: 'nodeAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Node operator address',
		displayOptions: { show: { resource: ['minipool'], operation: ['listMinipools', 'getNodeMinipoolCount'] } },
	},
	{
		displayName: 'Rebalance',
		name: 'rebalance',
		type: 'boolean',
		default: false,
		description: 'Whether to rebalance ETH during distribution',
		displayOptions: { show: { resource: ['minipool'], operation: ['distributeBalance'] } },
	},
];

export async function executeMinipoolOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getMinipool': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const info = await client.getMinipoolInfo(minipoolAddress);
			result = {
				address: minipoolAddress,
				status: MINIPOOL_STATUS_NAMES[info.status as MinipoolStatus] || 'Unknown',
				statusCode: info.status,
				depositType: DEPOSIT_TYPE_NAMES[info.depositType as MinipoolDepositType] || 'Unknown',
				nodeAddress: info.nodeAddress,
				nodeFee: info.nodeFee,
				userDepositBalance: info.userDepositBalance,
				nodeDepositBalance: info.nodeDepositBalance,
				pubkey: info.pubkey,
			};
			break;
		}

		case 'listMinipools': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const count = await client.getNodeMinipoolCount(nodeAddress);
			const minipoolManager = client.getMinipoolManagerContract();
			const minipools: Array<Record<string, unknown>> = [];
			
			for (let i = 0; i < parseInt(count); i++) {
				const address = await minipoolManager.getNodeMinipoolAt(nodeAddress, i);
				const info = await client.getMinipoolInfo(address);
				minipools.push({
					address,
					status: MINIPOOL_STATUS_NAMES[info.status as MinipoolStatus] || 'Unknown',
					depositType: DEPOSIT_TYPE_NAMES[info.depositType as MinipoolDepositType] || 'Unknown',
					nodeFee: info.nodeFee,
				});
			}
			
			result = {
				nodeAddress,
				count: parseInt(count),
				minipools,
			};
			break;
		}

		case 'getStatus': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const info = await client.getMinipoolInfo(minipoolAddress);
			result = {
				address: minipoolAddress,
				status: MINIPOOL_STATUS_NAMES[info.status as MinipoolStatus] || 'Unknown',
				statusCode: info.status,
			};
			break;
		}

		case 'getBalance': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const info = await client.getMinipoolInfo(minipoolAddress);
			result = {
				address: minipoolAddress,
				userDepositBalance: info.userDepositBalance,
				nodeDepositBalance: info.nodeDepositBalance,
				totalBalance: (parseFloat(info.userDepositBalance) + parseFloat(info.nodeDepositBalance)).toString(),
			};
			break;
		}

		case 'getNodeFee': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const info = await client.getMinipoolInfo(minipoolAddress);
			result = {
				address: minipoolAddress,
				nodeFee: info.nodeFee,
				nodeFeePercent: `${(parseFloat(info.nodeFee) * 100).toFixed(2)}%`,
			};
			break;
		}

		case 'getDepositType': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const info = await client.getMinipoolInfo(minipoolAddress);
			result = {
				address: minipoolAddress,
				depositType: DEPOSIT_TYPE_NAMES[info.depositType as MinipoolDepositType] || 'Unknown',
				depositTypeCode: info.depositType,
			};
			break;
		}

		case 'dissolve': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const tx = await client.dissolveMinipool(minipoolAddress);
			result = {
				transactionHash: tx.hash,
				minipool: minipoolAddress,
				action: 'dissolve',
				status: 'pending',
			};
			break;
		}

		case 'close': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const tx = await client.closeMinipool(minipoolAddress);
			result = {
				transactionHash: tx.hash,
				minipool: minipoolAddress,
				action: 'close',
				status: 'pending',
			};
			break;
		}

		case 'distributeBalance': {
			const minipoolAddress = this.getNodeParameter('minipoolAddress', index) as string;
			const rebalance = this.getNodeParameter('rebalance', index) as boolean;
			const tx = await client.distributeMinipoolBalance(minipoolAddress, rebalance);
			result = {
				transactionHash: tx.hash,
				minipool: minipoolAddress,
				rebalance,
				status: 'pending',
			};
			break;
		}

		case 'getMinipoolCount': {
			const count = await client.getMinipoolCount();
			result = {
				totalMinipools: count,
			};
			break;
		}

		case 'getNodeMinipoolCount': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const count = await client.getNodeMinipoolCount(nodeAddress);
			result = {
				nodeAddress,
				minipoolCount: count,
			};
			break;
		}

		case 'getQueueLength': {
			const minipoolManager = client.getMinipoolManagerContract();
			const count = await client.getMinipoolCount();
			result = {
				totalMinipools: count,
				message: 'Queue status depends on deposit pool capacity',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
