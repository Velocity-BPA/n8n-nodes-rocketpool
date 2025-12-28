/**
 * RPL Resource Operations
 * Manage RPL token staking and governance
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';

export const rplOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['rpl'] } },
		options: [
			{ name: 'Get Balance', value: 'getBalance', description: 'Get RPL balance for address', action: 'Get balance' },
			{ name: 'Get Price', value: 'getPrice', description: 'Get current RPL price in ETH', action: 'Get price' },
			{ name: 'Get Total Supply', value: 'getTotalSupply', description: 'Get total RPL supply', action: 'Get total supply' },
			{ name: 'Stake RPL', value: 'stakeRpl', description: 'Stake RPL as node collateral', action: 'Stake RPL' },
			{ name: 'Unstake RPL', value: 'unstakeRpl', description: 'Withdraw staked RPL', action: 'Unstake RPL' },
			{ name: 'Get Staked RPL', value: 'getStakedRpl', description: 'Get staked RPL for node', action: 'Get staked RPL' },
			{ name: 'Get Effective Stake', value: 'getEffectiveStake', description: 'Get effective RPL stake', action: 'Get effective stake' },
			{ name: 'Get Minimum Stake', value: 'getMinimumStake', description: 'Get minimum required RPL stake', action: 'Get minimum stake' },
			{ name: 'Get Maximum Stake', value: 'getMaximumStake', description: 'Get maximum effective RPL stake', action: 'Get maximum stake' },
			{ name: 'Transfer RPL', value: 'transferRpl', description: 'Transfer RPL tokens', action: 'Transfer RPL' },
			{ name: 'Approve RPL', value: 'approveRpl', description: 'Approve RPL spending', action: 'Approve RPL' },
		],
		default: 'getBalance',
	},
];

export const rplFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Ethereum address',
		displayOptions: { show: { resource: ['rpl'], operation: ['getBalance'] } },
	},
	{
		displayName: 'Node Address',
		name: 'nodeAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Node operator address',
		displayOptions: { show: { resource: ['rpl'], operation: ['getStakedRpl', 'getEffectiveStake', 'getMinimumStake', 'getMaximumStake'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '100.0',
		description: 'Amount of RPL',
		displayOptions: { show: { resource: ['rpl'], operation: ['stakeRpl', 'unstakeRpl', 'transferRpl', 'approveRpl'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['rpl'], operation: ['transferRpl'] } },
	},
	{
		displayName: 'Spender Address',
		name: 'spenderAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Spender address to approve',
		displayOptions: { show: { resource: ['rpl'], operation: ['approveRpl'] } },
	},
];

export async function executeRplOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getBalance': {
			const address = this.getNodeParameter('address', index) as string;
			const balance = await client.getRplBalance(address);
			const price = await client.getRplPrice();
			result = {
				address,
				rplBalance: balance,
				rplPrice: price,
				ethValue: (parseFloat(balance) * parseFloat(price)).toFixed(6),
			};
			break;
		}

		case 'getPrice': {
			const price = await client.getRplPrice();
			result = {
				rplPrice: price,
				priceUnit: 'ETH per RPL',
			};
			break;
		}

		case 'getTotalSupply': {
			const rplContract = client.getRplContract();
			const totalSupply = await rplContract.totalSupply();
			result = {
				totalSupply: client.formatEth(totalSupply),
				totalSupplyWei: totalSupply.toString(),
			};
			break;
		}

		case 'stakeRpl': {
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.stakeRpl(amount);
			result = {
				transactionHash: tx.hash,
				amount,
				status: 'pending',
				message: `Staking ${amount} RPL`,
			};
			break;
		}

		case 'unstakeRpl': {
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.withdrawRpl(amount);
			result = {
				transactionHash: tx.hash,
				amount,
				status: 'pending',
				message: `Withdrawing ${amount} RPL`,
			};
			break;
		}

		case 'getStakedRpl': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const stakedRpl = await client.getNodeRplStake(nodeAddress);
			const price = await client.getRplPrice();
			result = {
				nodeAddress,
				stakedRpl,
				rplPrice: price,
				ethValue: (parseFloat(stakedRpl) * parseFloat(price)).toFixed(6),
			};
			break;
		}

		case 'getEffectiveStake': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const effectiveStake = await client.getNodeEffectiveRplStake(nodeAddress);
			const totalStake = await client.getNodeRplStake(nodeAddress);
			result = {
				nodeAddress,
				effectiveRplStake: effectiveStake,
				totalRplStake: totalStake,
				utilizationPercent: totalStake !== '0' 
					? `${((parseFloat(effectiveStake) / parseFloat(totalStake)) * 100).toFixed(2)}%`
					: '0%',
			};
			break;
		}

		case 'getMinimumStake': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const minStake = await client.getNodeMinRplStake(nodeAddress);
			const price = await client.getRplPrice();
			result = {
				nodeAddress,
				minimumRplStake: minStake,
				minimumEthValue: (parseFloat(minStake) * parseFloat(price)).toFixed(6),
				description: 'Minimum 10% of bonded ETH value in RPL required',
			};
			break;
		}

		case 'getMaximumStake': {
			const nodeAddress = this.getNodeParameter('nodeAddress', index) as string;
			const maxStake = await client.getNodeMaxRplStake(nodeAddress);
			const price = await client.getRplPrice();
			result = {
				nodeAddress,
				maximumRplStake: maxStake,
				maximumEthValue: (parseFloat(maxStake) * parseFloat(price)).toFixed(6),
				description: 'Maximum 150% of bonded ETH value counts toward rewards',
			};
			break;
		}

		case 'transferRpl': {
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.transferRpl(toAddress, amount);
			result = {
				transactionHash: tx.hash,
				to: toAddress,
				amount,
				status: 'pending',
			};
			break;
		}

		case 'approveRpl': {
			const spenderAddress = this.getNodeParameter('spenderAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.approveRpl(spenderAddress, amount);
			result = {
				transactionHash: tx.hash,
				spender: spenderAddress,
				amount,
				status: 'pending',
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
