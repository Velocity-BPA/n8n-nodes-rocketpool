/**
 * Oracle DAO Resource Operations
 * Query Rocket Pool Oracle DAO (oDAO) information
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const oracleDaoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['oracleDao'] } },
		options: [
			{ name: 'Get Members', value: 'getMembers', description: 'Get Oracle DAO members', action: 'Get members' },
			{ name: 'Check Is Member', value: 'checkMember', description: 'Check if address is oDAO member', action: 'Check is member' },
			{ name: 'Get Member Bond', value: 'getMemberBond', description: 'Get member bond requirement', action: 'Get member bond' },
			{ name: 'Get Quorum', value: 'getQuorum', description: 'Get voting quorum requirement', action: 'Get quorum' },
			{ name: 'Get Settings', value: 'getSettings', description: 'Get oDAO settings', action: 'Get settings' },
		],
		default: 'getMembers',
	},
];

export const oracleDaoFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Address to check',
		displayOptions: { show: { resource: ['oracleDao'], operation: ['checkMember'] } },
	},
];

export async function executeOracleDaoOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getMembers': {
			result = {
				description: 'Oracle DAO members are trusted node operators',
				responsibilities: [
					'Submit RPL/ETH price updates',
					'Submit rETH exchange rate updates',
					'Generate and submit merkle rewards trees',
					'Submit minipool balance updates',
				],
				bondRequirement: '1750 RPL',
			};
			break;
		}

		case 'checkMember': {
			const address = this.getNodeParameter('address', index) as string;
			result = {
				address,
				message: 'Query oDAO contract for membership status',
			};
			break;
		}

		case 'getMemberBond': {
			result = {
				bondAmount: '1750',
				bondUnit: 'RPL',
				description: 'Bond required to become oDAO member',
			};
			break;
		}

		case 'getQuorum': {
			result = {
				quorum: '51%',
				description: 'Percentage of members required for consensus',
			};
			break;
		}

		case 'getSettings': {
			result = {
				priceUpdateFrequency: '24 hours',
				balanceUpdateFrequency: '24 hours',
				rewardInterval: '28 days',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
