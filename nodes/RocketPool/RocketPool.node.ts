/**
 * Rocket Pool Node
 * Comprehensive n8n node for Rocket Pool decentralized ETH staking protocol
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 *
 * Use of this node by for-profit organizations in production environments
 * requires a commercial license from Velocity BPA.
 *
 * For licensing information, visit https://velobpa.com/licensing
 * or contact licensing@velobpa.com.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import {
	stakingOperations,
	stakingFields,
	executeStakingOperation,
} from './actions/staking';

import {
	rethOperations,
	rethFields,
	executeRethOperation,
} from './actions/reth';

import {
	nodeOperatorOperations,
	nodeOperatorFields,
	executeNodeOperatorOperation,
} from './actions/nodeOperator';

import {
	minipoolOperations,
	minipoolFields,
	executeMinipoolOperation,
} from './actions/minipool';

import {
	rplOperations,
	rplFields,
	executeRplOperation,
} from './actions/rpl';

import {
	rewardsOperations,
	rewardsFields,
	executeRewardsOperation,
} from './actions/rewards';

import {
	depositPoolOperations,
	depositPoolFields,
	executeDepositPoolOperation,
} from './actions/depositPool';

import {
	networkOperations,
	networkFields,
	executeNetworkOperation,
} from './actions/network';

import {
	daoOperations,
	daoFields,
	executeDaoOperation,
} from './actions/dao';

import {
	oracleDaoOperations,
	oracleDaoFields,
	executeOracleDaoOperation,
} from './actions/oracleDao';

import {
	protocolDaoOperations,
	protocolDaoFields,
	executeProtocolDaoOperation,
} from './actions/protocolDao';

import {
	auctionOperations,
	auctionFields,
	executeAuctionOperation,
} from './actions/auction';

import {
	smoothingPoolOperations,
	smoothingPoolFields,
	executeSmoothingPoolOperation,
} from './actions/smoothingPool';

import {
	merkleRewardsOperations,
	merkleRewardsFields,
	executeMerkleRewardsOperation,
} from './actions/merkleRewards';

import {
	beaconChainOperations,
	beaconChainFields,
	executeBeaconChainOperation,
} from './actions/beaconChain';

import {
	pricesOperations,
	pricesFields,
	executePricesOperation,
} from './actions/prices';

import {
	inflationOperations,
	inflationFields,
	executeInflationOperation,
} from './actions/inflation';

import {
	analyticsOperations,
	analyticsFields,
	executeAnalyticsOperation,
} from './actions/analytics';

import {
	subgraphOperations,
	subgraphFields,
	executeSubgraphOperation,
} from './actions/subgraph';

import {
	utilityOperations,
	utilityFields,
	executeUtilityOperation,
} from './actions/utility';

// Log licensing notice once on module load
let licenseLogged = false;
function logLicenseNotice(): void {
	if (!licenseLogged) {
		console.warn(`[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
		licenseLogged = true;
	}
}

export class RocketPool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Rocket Pool',
		name: 'rocketPool',
		icon: 'file:rocketpool.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Rocket Pool decentralized ETH staking protocol',
		defaults: {
			name: 'Rocket Pool',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'rocketPoolNetwork',
				required: true,
			},
			{
				name: 'rocketPoolOperator',
				required: false,
			},
			{
				name: 'rocketPoolApi',
				required: false,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Analytics', value: 'analytics' },
					{ name: 'Auction', value: 'auction' },
					{ name: 'Beacon Chain', value: 'beaconChain' },
					{ name: 'DAO', value: 'dao' },
					{ name: 'Deposit Pool', value: 'depositPool' },
					{ name: 'Inflation', value: 'inflation' },
					{ name: 'Merkle Rewards', value: 'merkleRewards' },
					{ name: 'Minipool', value: 'minipool' },
					{ name: 'Network', value: 'network' },
					{ name: 'Node Operator', value: 'nodeOperator' },
					{ name: 'Oracle DAO', value: 'oracleDao' },
					{ name: 'Prices', value: 'prices' },
					{ name: 'Protocol DAO', value: 'protocolDao' },
					{ name: 'rETH', value: 'reth' },
					{ name: 'Rewards', value: 'rewards' },
					{ name: 'RPL', value: 'rpl' },
					{ name: 'Smoothing Pool', value: 'smoothingPool' },
					{ name: 'Staking', value: 'staking' },
					{ name: 'Subgraph', value: 'subgraph' },
					{ name: 'Utility', value: 'utility' },
				],
				default: 'staking',
			},
			// Operations for each resource
			...stakingOperations,
			...rethOperations,
			...nodeOperatorOperations,
			...minipoolOperations,
			...rplOperations,
			...rewardsOperations,
			...depositPoolOperations,
			...networkOperations,
			...daoOperations,
			...oracleDaoOperations,
			...protocolDaoOperations,
			...auctionOperations,
			...smoothingPoolOperations,
			...merkleRewardsOperations,
			...beaconChainOperations,
			...pricesOperations,
			...inflationOperations,
			...analyticsOperations,
			...subgraphOperations,
			...utilityOperations,
			// Fields for each resource
			...stakingFields,
			...rethFields,
			...nodeOperatorFields,
			...minipoolFields,
			...rplFields,
			...rewardsFields,
			...depositPoolFields,
			...networkFields,
			...daoFields,
			...oracleDaoFields,
			...protocolDaoFields,
			...auctionFields,
			...smoothingPoolFields,
			...merkleRewardsFields,
			...beaconChainFields,
			...pricesFields,
			...inflationFields,
			...analyticsFields,
			...subgraphFields,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		logLicenseNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				let result: INodeExecutionData[];

				switch (resource) {
					case 'staking':
						result = await executeStakingOperation.call(this, i);
						break;
					case 'reth':
						result = await executeRethOperation.call(this, i);
						break;
					case 'nodeOperator':
						result = await executeNodeOperatorOperation.call(this, i);
						break;
					case 'minipool':
						result = await executeMinipoolOperation.call(this, i);
						break;
					case 'rpl':
						result = await executeRplOperation.call(this, i);
						break;
					case 'rewards':
						result = await executeRewardsOperation.call(this, i);
						break;
					case 'depositPool':
						result = await executeDepositPoolOperation.call(this, i);
						break;
					case 'network':
						result = await executeNetworkOperation.call(this, i);
						break;
					case 'dao':
						result = await executeDaoOperation.call(this, i);
						break;
					case 'oracleDao':
						result = await executeOracleDaoOperation.call(this, i);
						break;
					case 'protocolDao':
						result = await executeProtocolDaoOperation.call(this, i);
						break;
					case 'auction':
						result = await executeAuctionOperation.call(this, i);
						break;
					case 'smoothingPool':
						result = await executeSmoothingPoolOperation.call(this, i);
						break;
					case 'merkleRewards':
						result = await executeMerkleRewardsOperation.call(this, i);
						break;
					case 'beaconChain':
						result = await executeBeaconChainOperation.call(this, i);
						break;
					case 'prices':
						result = await executePricesOperation.call(this, i);
						break;
					case 'inflation':
						result = await executeInflationOperation.call(this, i);
						break;
					case 'analytics':
						result = await executeAnalyticsOperation.call(this, i);
						break;
					case 'subgraph':
						result = await executeSubgraphOperation.call(this, i);
						break;
					case 'utility':
						result = await executeUtilityOperation.call(this, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
