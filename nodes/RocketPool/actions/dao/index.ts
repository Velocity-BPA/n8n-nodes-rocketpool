/**
 * DAO Resource Operations
 * Query Rocket Pool DAO information
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const daoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['dao'] } },
		options: [
			{ name: 'Get DAO Overview', value: 'getOverview', description: 'Get DAO overview information', action: 'Get DAO overview' },
			{ name: 'Get Protocol DAO Info', value: 'getProtocolDao', description: 'Get Protocol DAO information', action: 'Get Protocol DAO info' },
			{ name: 'Get Oracle DAO Info', value: 'getOracleDao', description: 'Get Oracle DAO information', action: 'Get Oracle DAO info' },
			{ name: 'Get Security Council', value: 'getSecurityCouncil', description: 'Get Security Council info', action: 'Get Security Council' },
		],
		default: 'getOverview',
	},
];

export const daoFields: INodeProperties[] = [];

export async function executeDaoOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getOverview': {
			result = {
				protocolDao: {
					name: 'Protocol DAO (pDAO)',
					description: 'Governance for protocol settings, controlled by RPL holders',
				},
				oracleDao: {
					name: 'Oracle DAO (oDAO)',
					description: 'Trusted node operators submitting price/balance updates',
				},
				securityCouncil: {
					name: 'Security Council',
					description: 'Emergency response team for security issues',
				},
			};
			break;
		}

		case 'getProtocolDao': {
			result = {
				name: 'Protocol DAO',
				description: 'Governs protocol parameters via on-chain voting',
				votingPower: 'Based on RPL stake',
				proposalTypes: ['Settings changes', 'Spending proposals', 'Protocol upgrades'],
			};
			break;
		}

		case 'getOracleDao': {
			result = {
				name: 'Oracle DAO',
				description: 'Trusted nodes that submit off-chain data on-chain',
				responsibilities: [
					'RPL/ETH price updates',
					'rETH exchange rate updates',
					'Minipool balance submissions',
					'Merkle rewards tree generation',
				],
				bondRequirement: '1750 RPL per member',
			};
			break;
		}

		case 'getSecurityCouncil': {
			result = {
				name: 'Security Council',
				description: 'Emergency response for security vulnerabilities',
				powers: [
					'Pause protocol in emergencies',
					'Execute security patches',
					'Coordinate incident response',
				],
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
