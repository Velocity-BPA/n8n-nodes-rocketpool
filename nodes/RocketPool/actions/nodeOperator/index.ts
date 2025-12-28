/**
 * Node Operator Resource Operations
 * Manage Rocket Pool node operator functions
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const nodeOperatorOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['nodeOperator'] } },
		options: [
			{ name: 'Register Node', value: 'registerNode', description: 'Register a new node operator', action: 'Register node' },
			{ name: 'Get Node Details', value: 'getNodeDetails', description: 'Get node operator details', action: 'Get node details' },
			{ name: 'Get Node Fee', value: 'getNodeFee', description: 'Get node commission fee', action: 'Get node fee' },
			{ name: 'Get RPL Stake', value: 'getRplStake', description: 'Get node RPL stake amount', action: 'Get RPL stake' },
			{ name: 'Get Effective RPL Stake', value: 'getEffectiveRplStake', description: 'Get effective RPL stake', action: 'Get effective RPL stake' },
			{ name: 'Get Node Minipools', value: 'getNodeMinipools', description: 'Get node minipool count', action: 'Get node minipools' },
			{ name: 'Get Pending Rewards', value: 'getPendingRewards', description: 'Get pending rewards for node', action: 'Get pending rewards' },
			{ name: 'Get Timezone', value: 'getTimezone', description: 'Get node timezone', action: 'Get timezone' },
			{ name: 'Set Withdrawal Address', value: 'setWithdrawalAddress', description: 'Set node withdrawal address', action: 'Set withdrawal address' },
			{ name: 'Get Smoothing Pool Status', value: 'getSmoothingPoolStatus', description: 'Check if node is in smoothing pool', action: 'Get smoothing pool status' },
			{ name: 'Set Smoothing Pool Status', value: 'setSmoothingPoolStatus', description: 'Opt in/out of smoothing pool', action: 'Set smoothing pool status' },
			{ name: 'Check Node Exists', value: 'checkNodeExists', description: 'Check if address is registered node', action: 'Check node exists' },
		],
		default: 'getNodeDetails',
	},
];

export const nodeOperatorFields: INodeProperties[] = [
	{
		displayName: 'Node Address',
		name: 'nodeAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Node operator address',
		displayOptions: { show: { resource: ['nodeOperator'], operation: ['getNodeDetails', 'getNodeFee', 'getRplStake', 'getEffectiveRplStake', 'getNodeMinipools', 'getPendingRewards', 'getTimezone', 'getSmoothingPoolStatus', 'checkNodeExists'] } },
	},
	{
		displayName: 'Timezone',
		name: 'timezone',
		type: 'string',
		required: true,
		default: 'UTC',
		placeholder: 'America/New_York',
		description: 'Node timezone (IANA format)',
		displayOptions: { show: { resource: ['nodeOperator'], operation: ['registerNode'] } },
	},
	{
		displayName: 'Withdrawal Address',
		name: 'withdrawalAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Address for withdrawals',
		displayOptions: { show: { resource: ['nodeOperator'], operation: ['setWithdrawalAddress'] } },
	},
	{
		displayName: 'Confirm',
		name: 'confirm',
		type: 'boolean',
		default: false,
		description: 'Whether to confirm the withdrawal address change',
		displayOptions: { show: { resource: ['nodeOperator'], operation: ['setWithdrawalAddress'] } },
	},
	{
		displayName: 'Opt In',
		name: 'optIn',
		type: 'boolean',
		default: true,
		description: 'Whether to opt in (true) or out (false) of smoothing pool',
		displayOptions: { show: { resource: ['nodeOperator'], operation: ['setSmoothingPoolStatus'] } },
	},
];

export async function executeNodeOperatorOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const operatorCredentials = await this.getCredentials('rocketPoolOperator').catch(() => null);
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'registerNode': {
			const timezone = this.getNodeParameter('timezone', index) as string;
			const tx = await client.registerNode(timezone);
			result = {
				transactionHash: tx.hash,
				timezone,
				status: 'pending',
				message: 'Node registration submitted',
			};
			break;
		}

		case 'getNodeDetails': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const exists = await client.getNodeExists(nodeAddress);
			if (!exists) {
				result = { nodeAddress, exists: false, message: 'Node not registered' };
				break;
			}
			const timezone = await client.getNodeTimezone(nodeAddress);
			const withdrawalAddress = await client.getNodeWithdrawalAddress(nodeAddress);
			const rplStake = await client.getNodeRplStake(nodeAddress);
			const effectiveStake = await client.getNodeEffectiveRplStake(nodeAddress);
			const minipoolCount = await client.getNodeMinipoolCount(nodeAddress);
			const smoothingPool = await client.getSmoothingPoolStatus(nodeAddress);

			result = {
				nodeAddress,
				exists: true,
				timezone,
				withdrawalAddress,
				rplStake,
				effectiveRplStake: effectiveStake,
				minipoolCount,
				smoothingPoolOptedIn: smoothingPool,
			};
			break;
		}

		case 'getNodeFee': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const nodeManager = client.getNodeManagerContract();
			const feeNumerator = await nodeManager.getNodeFeeDistributorShare(nodeAddress);
			const feePercent = (Number(feeNumerator) / 1e16).toFixed(2);
			result = {
				nodeAddress,
				feeNumerator: feeNumerator.toString(),
				feePercent: `${feePercent}%`,
			};
			break;
		}

		case 'getRplStake': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const rplStake = await client.getNodeRplStake(nodeAddress);
			const rplPrice = await client.getRplPrice();
			result = {
				nodeAddress,
				rplStake,
				rplPrice,
				ethValue: (parseFloat(rplStake) * parseFloat(rplPrice)).toFixed(6),
			};
			break;
		}

		case 'getEffectiveRplStake': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const effectiveStake = await client.getNodeEffectiveRplStake(nodeAddress);
			const minStake = await client.getNodeMinRplStake(nodeAddress);
			const maxStake = await client.getNodeMaxRplStake(nodeAddress);
			result = {
				nodeAddress,
				effectiveRplStake: effectiveStake,
				minimumRplStake: minStake,
				maximumRplStake: maxStake,
			};
			break;
		}

		case 'getNodeMinipools': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const count = await client.getNodeMinipoolCount(nodeAddress);
			result = {
				nodeAddress,
				minipoolCount: count,
			};
			break;
		}

		case 'getPendingRewards': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const rewardsPool = client.getRewardsPoolContract();
			result = {
				nodeAddress,
				message: 'Use Rewards resource for detailed reward information',
			};
			break;
		}

		case 'getTimezone': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const timezone = await client.getNodeTimezone(nodeAddress);
			result = { nodeAddress, timezone };
			break;
		}

		case 'setWithdrawalAddress': {
			const withdrawalAddress = this.getNodeParameter('withdrawalAddress', index) as string;
			const confirm = this.getNodeParameter('confirm', index) as boolean;
			const tx = await client.setWithdrawalAddress(withdrawalAddress, confirm);
			result = {
				transactionHash: tx.hash,
				withdrawalAddress,
				confirmed: confirm,
				status: 'pending',
			};
			break;
		}

		case 'getSmoothingPoolStatus': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const status = await client.getSmoothingPoolStatus(nodeAddress);
			result = {
				nodeAddress,
				optedIn: status,
				message: status ? 'Node is in smoothing pool' : 'Node is not in smoothing pool',
			};
			break;
		}

		case 'setSmoothingPoolStatus': {
			const optIn = this.getNodeParameter('optIn', index) as boolean;
			const tx = await client.setSmoothingPoolState(optIn);
			result = {
				transactionHash: tx.hash,
				optedIn: optIn,
				status: 'pending',
			};
			break;
		}

		case 'checkNodeExists': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const exists = await client.getNodeExists(nodeAddress);
			result = {
				nodeAddress,
				exists,
				message: exists ? 'Address is a registered node' : 'Address is not a registered node',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
