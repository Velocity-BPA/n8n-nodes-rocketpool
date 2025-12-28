/**
 * Subgraph Resource Operations
 * Query Rocket Pool subgraph data
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createSubgraphClient } from '../../transport/subgraphClient';

export const subgraphOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['subgraph'] } },
		options: [
			{ name: 'Query Nodes', value: 'queryNodes', description: 'Query node operators from subgraph', action: 'Query nodes' },
			{ name: 'Query Minipools', value: 'queryMinipools', description: 'Query minipools from subgraph', action: 'Query minipools' },
			{ name: 'Query Stakers', value: 'queryStakers', description: 'Query rETH stakers from subgraph', action: 'Query stakers' },
			{ name: 'Query Rewards', value: 'queryRewards', description: 'Query reward claims from subgraph', action: 'Query rewards' },
			{ name: 'Custom Query', value: 'customQuery', description: 'Run custom GraphQL query', action: 'Custom query' },
			{ name: 'Get Status', value: 'getStatus', description: 'Get subgraph indexing status', action: 'Get status' },
			{ name: 'Search Nodes', value: 'searchNodes', description: 'Search nodes by address', action: 'Search nodes' },
		],
		default: 'queryNodes',
	},
];

export const subgraphFields: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 10,
		description: 'Maximum number of results',
		displayOptions: { show: { resource: ['subgraph'], operation: ['queryNodes', 'queryMinipools', 'queryStakers', 'queryRewards'] } },
	},
	{
		displayName: 'Node Address',
		name: 'nodeAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Node operator address',
		displayOptions: { show: { resource: ['subgraph'], operation: ['searchNodes'] } },
	},
	{
		displayName: 'GraphQL Query',
		name: 'graphqlQuery',
		type: 'string',
		typeOptions: { rows: 10 },
		required: true,
		default: '{\n  nodes(first: 10) {\n    id\n    minipoolCount\n  }\n}',
		description: 'Custom GraphQL query',
		displayOptions: { show: { resource: ['subgraph'], operation: ['customQuery'] } },
	},
];

export async function executeSubgraphOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolApi');
	const client = createSubgraphClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'queryNodes': {
			const limit = this.getNodeParameter('limit', index) as number;
			const nodes = await client.getNodes(limit);
			result = {
				nodes,
				count: nodes.length,
			};
			break;
		}

		case 'queryMinipools': {
			const limit = this.getNodeParameter('limit', index) as number;
			const minipools = await client.getMinipools(limit);
			result = {
				minipools,
				count: minipools.length,
			};
			break;
		}

		case 'queryStakers': {
			const limit = this.getNodeParameter('limit', index) as number;
			const stakers = await client.getStakers(limit);
			result = {
				stakers,
				count: stakers.length,
			};
			break;
		}

		case 'queryRewards': {
			const limit = this.getNodeParameter('limit', index) as number;
			result = {
				message: 'Use getNodeRewardClaims with specific node address',
				limit,
			};
			break;
		}

		case 'customQuery': {
			const graphqlQuery = this.getNodeParameter('graphqlQuery', index) as string;
			const data = await client.query(graphqlQuery);
			result = {
				data,
			};
			break;
		}

		case 'getStatus': {
			const status = await client.getIndexingStatus();
			result = {
				status,
			};
			break;
		}

		case 'searchNodes': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const nodes = await client.searchNodes(nodeAddress.toLowerCase());
			result = {
				nodes,
				count: nodes.length,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
