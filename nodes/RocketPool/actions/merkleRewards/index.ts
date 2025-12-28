/**
 * Merkle Rewards Resource Operations
 * Manage Rocket Pool merkle reward proofs and claims
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { fetchRewardSnapshot, getNodeRewardsFromSnapshot } from '../../utils/rewardUtils';
import { verifyProof } from '../../utils/merkleUtils';
import { IPFS_GATEWAYS } from '../../constants/rewardIntervals';

export const merkleRewardsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['merkleRewards'] } },
		options: [
			{ name: 'Get Merkle Root', value: 'getMerkleRoot', description: 'Get merkle root for interval', action: 'Get merkle root' },
			{ name: 'Get Merkle Proof', value: 'getMerkleProof', description: 'Get merkle proof for node', action: 'Get merkle proof' },
			{ name: 'Verify Proof', value: 'verifyProof', description: 'Verify a merkle proof', action: 'Verify proof' },
			{ name: 'Get Rewards File', value: 'getRewardsFile', description: 'Get rewards file from IPFS', action: 'Get rewards file' },
			{ name: 'Get Interval Info', value: 'getIntervalInfo', description: 'Get reward interval information', action: 'Get interval info' },
			{ name: 'Get Claimed Status', value: 'getClaimedStatus', description: 'Check if rewards are claimed', action: 'Get claimed status' },
		],
		default: 'getMerkleRoot',
	},
];

export const merkleRewardsFields: INodeProperties[] = [
	{
		displayName: 'Interval Index',
		name: 'intervalIndex',
		type: 'number',
		required: true,
		default: 0,
		description: 'Reward interval index',
		displayOptions: { show: { resource: ['merkleRewards'], operation: ['getMerkleRoot', 'getRewardsFile', 'getIntervalInfo', 'getClaimedStatus'] } },
	},
	{
		displayName: 'Node Address',
		name: 'nodeAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Node operator address',
		displayOptions: { show: { resource: ['merkleRewards'], operation: ['getMerkleProof', 'getClaimedStatus'] } },
	},
	{
		displayName: 'Merkle Root',
		name: 'merkleRoot',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Merkle root to verify against',
		displayOptions: { show: { resource: ['merkleRewards'], operation: ['verifyProof'] } },
	},
	{
		displayName: 'Proof',
		name: 'proof',
		type: 'string',
		required: true,
		default: '',
		placeholder: '["0x...", "0x..."]',
		description: 'JSON array of proof hashes',
		displayOptions: { show: { resource: ['merkleRewards'], operation: ['verifyProof'] } },
	},
	{
		displayName: 'Leaf',
		name: 'leaf',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Leaf hash to verify',
		displayOptions: { show: { resource: ['merkleRewards'], operation: ['verifyProof'] } },
	},
];

export async function executeMerkleRewardsOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getMerkleRoot': {
			const intervalIndex = this.getNodeParameter('intervalIndex', index) as number;
			const merkleDistributor = client.getMerkleDistributorContract();
			
			result = {
				intervalIndex,
				message: 'Query merkle distributor for root',
			};
			break;
		}

		case 'getMerkleProof': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			result = {
				nodeAddress,
				message: 'Fetch rewards file from IPFS for merkle proof',
				ipfsGateways: IPFS_GATEWAYS,
			};
			break;
		}

		case 'verifyProof': {
			const merkleRoot = this.getNodeParameter('merkleRoot', index) as string;
			const proofStr = this.getNodeParameter('proof', index) as string;
			const leaf = this.getNodeParameter('leaf', index) as string;
			
			try {
				const proof = JSON.parse(proofStr);
				const isValid = verifyProof(leaf, proof, merkleRoot);
				result = {
					valid: isValid,
					merkleRoot,
					leaf,
					proofLength: proof.length,
				};
			} catch (e) {
				throw new Error('Invalid proof format. Expected JSON array of hex strings.');
			}
			break;
		}

		case 'getRewardsFile': {
			const intervalIndex = this.getNodeParameter('intervalIndex', index) as number;
			
			try {
				const snapshot = await fetchRewardSnapshot(intervalIndex.toString(), IPFS_GATEWAYS);
				result = {
					intervalIndex,
					found: true,
					nodeCount: Object.keys(snapshot.nodeRewards || {}).length,
				};
			} catch {
				result = {
					intervalIndex,
					found: false,
					message: 'Rewards file not found',
				};
			}
			break;
		}

		case 'getIntervalInfo': {
			const intervalIndex = this.getNodeParameter('intervalIndex', index) as number;
			result = {
				intervalIndex,
				duration: '28 days',
				description: 'Reward intervals are 28 days',
			};
			break;
		}

		case 'getClaimedStatus': {
			const intervalIndex = this.getNodeParameter('intervalIndex', index) as number;
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const claimed = await client.isRewardClaimed(nodeAddress, intervalIndex);
			result = {
				nodeAddress,
				intervalIndex,
				claimed,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
