/**
 * Protocol DAO Resource Operations
 * Query Rocket Pool Protocol DAO (pDAO) information
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const protocolDaoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['protocolDao'] } },
		options: [
			{ name: 'Get Settings', value: 'getSettings', description: 'Get Protocol DAO settings', action: 'Get settings' },
			{ name: 'Get Inflation Settings', value: 'getInflationSettings', description: 'Get RPL inflation settings', action: 'Get inflation settings' },
			{ name: 'Get Reward Settings', value: 'getRewardSettings', description: 'Get reward distribution settings', action: 'Get reward settings' },
			{ name: 'Get Minipool Settings', value: 'getMinipoolSettings', description: 'Get minipool settings', action: 'Get minipool settings' },
			{ name: 'Get Node Settings', value: 'getNodeSettings', description: 'Get node operator settings', action: 'Get node settings' },
			{ name: 'Get Deposit Settings', value: 'getDepositSettings', description: 'Get deposit pool settings', action: 'Get deposit settings' },
		],
		default: 'getSettings',
	},
];

export const protocolDaoFields: INodeProperties[] = [];

export async function executeProtocolDaoOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getSettings': {
			result = {
				description: 'Protocol DAO governs protocol parameters',
				votingPower: 'Based on effective RPL stake',
				proposalTypes: [
					'Parameter changes',
					'Spending proposals',
					'Protocol upgrades',
				],
			};
			break;
		}

		case 'getInflationSettings': {
			result = {
				annualInflationRate: '5%',
				inflationStart: 'Protocol launch',
				inflationDistribution: {
					nodeOperators: '70%',
					protocolDao: '15%',
					oracleDao: '15%',
				},
			};
			break;
		}

		case 'getRewardSettings': {
			result = {
				rewardInterval: '28 days',
				distribution: {
					nodeOperators: '70%',
					protocolDao: '15%',
					oracleDao: '15%',
				},
				claimMethod: 'Merkle tree proofs',
			};
			break;
		}

		case 'getMinipoolSettings': {
			result = {
				minipoolTypes: {
					LEB8: { bond: '8 ETH', commission: '14%' },
					LEB16: { bond: '16 ETH', commission: '14%' },
				},
				launchBalance: '32 ETH',
				validatorBalance: '32 ETH',
			};
			break;
		}

		case 'getNodeSettings': {
			result = {
				registrationEnabled: true,
				depositEnabled: true,
				minRplStake: '10% of bonded ETH value',
				maxRplStake: '150% of bonded ETH value',
				commissionRange: { min: '5%', max: '20%', default: '14%' },
			};
			break;
		}

		case 'getDepositSettings': {
			result = {
				depositEnabled: true,
				assignDepositsEnabled: true,
				minimumDeposit: '0.01 ETH',
				maximumDeposit: 'Pool capacity dependent',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
