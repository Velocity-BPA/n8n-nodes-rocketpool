/**
 * Beacon Chain Resource Operations
 * Query Ethereum beacon chain validator data
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createBeaconClient } from '../../transport/beaconClient';
import { gweiToEth, slotToEpoch, calculateEffectiveBalance } from '../../utils/validatorUtils';

export const beaconChainOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['beaconChain'] } },
		options: [
			{ name: 'Get Validator Info', value: 'getValidator', description: 'Get validator information', action: 'Get validator info' },
			{ name: 'Get Validator Balance', value: 'getBalance', description: 'Get validator balance', action: 'Get validator balance' },
			{ name: 'Get Validator Status', value: 'getStatus', description: 'Get validator status', action: 'Get validator status' },
			{ name: 'Get Sync Committee', value: 'getSyncCommittee', description: 'Get current sync committee', action: 'Get sync committee' },
			{ name: 'Get Genesis', value: 'getGenesis', description: 'Get beacon chain genesis info', action: 'Get genesis' },
			{ name: 'Get Finality', value: 'getFinality', description: 'Get finality checkpoints', action: 'Get finality' },
			{ name: 'Get Node Health', value: 'getHealth', description: 'Get beacon node health', action: 'Get node health' },
		],
		default: 'getValidator',
	},
];

export const beaconChainFields: INodeProperties[] = [
	{
		displayName: 'Validator ID',
		name: 'validatorId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x... or validator index',
		description: 'Validator public key or index',
		displayOptions: { show: { resource: ['beaconChain'], operation: ['getValidator', 'getBalance', 'getStatus'] } },
	},
];

export async function executeBeaconChainOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const beaconClient = createBeaconClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getValidator': {
			const validatorId = this.getNodeParameter('validatorId', index) as string;
			const validator = await beaconClient.getValidator(validatorId);
			
			result = {
				index: validator.index,
				pubkey: validator.validator.pubkey,
				status: validator.status,
				balance: gweiToEth(parseInt(validator.balance)).toString(),
				effectiveBalance: gweiToEth(parseInt(validator.validator.effective_balance)).toString(),
				slashed: validator.validator.slashed,
				activationEpoch: validator.validator.activation_epoch,
				exitEpoch: validator.validator.exit_epoch,
				withdrawableEpoch: validator.validator.withdrawable_epoch,
			};
			break;
		}

		case 'getBalance': {
			const validatorId = this.getNodeParameter('validatorId', index) as string;
			const balance = await beaconClient.getValidatorBalance(validatorId);
			
			result = {
				index: balance.index,
				balanceGwei: balance.balance,
				balanceEth: gweiToEth(parseInt(balance.balance)).toString(),
			};
			break;
		}

		case 'getStatus': {
			const validatorId = this.getNodeParameter('validatorId', index) as string;
			const validator = await beaconClient.getValidator(validatorId);
			
			result = {
				index: validator.index,
				status: validator.status,
				statusDescription: beaconClient.formatValidatorStatus(validator.status),
			};
			break;
		}

		case 'getSyncCommittee': {
			const committee = await beaconClient.getSyncCommittee();
			
			result = {
				validators: committee.validators?.length || 0,
				message: 'Sync committee for current epoch',
			};
			break;
		}

		case 'getGenesis': {
			const genesis = await beaconClient.getGenesis();
			
			result = {
				genesisTime: genesis.genesis_time,
				genesisValidatorsRoot: genesis.genesis_validators_root,
				genesisForkVersion: genesis.genesis_fork_version,
			};
			break;
		}

		case 'getFinality': {
			const finality = await beaconClient.getFinalityCheckpoints();
			
			result = {
				previousJustified: finality.previous_justified,
				currentJustified: finality.current_justified,
				finalized: finality.finalized,
			};
			break;
		}

		case 'getHealth': {
			const health = await beaconClient.getHealth();
			const version = await beaconClient.getNodeVersion();
			const syncing = await beaconClient.getSyncingStatus();
			
			result = {
				healthy: health,
				version,
				syncing: syncing.is_syncing,
				syncDistance: syncing.sync_distance,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
