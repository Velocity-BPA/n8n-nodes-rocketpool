/**
 * Staking Resource Operations
 * Stake ETH, manage rETH, and interact with the deposit pool
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { ethToReth, rethToEth, calculateRethApr } from '../../utils/rethUtils';

export const stakingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['staking'],
			},
		},
		options: [
			{ name: 'Stake ETH', value: 'stakeEth', description: 'Stake ETH and receive rETH', action: 'Stake ETH' },
			{ name: 'Get rETH Balance', value: 'getRethBalance', description: 'Get rETH balance for an address', action: 'Get rETH balance' },
			{ name: 'Get Exchange Rate', value: 'getExchangeRate', description: 'Get current ETH/rETH exchange rate', action: 'Get exchange rate' },
			{ name: 'Get ETH Value', value: 'getEthValue', description: 'Get ETH value of rETH amount', action: 'Get ETH value' },
			{ name: 'Unstake rETH', value: 'unstakeReth', description: 'Burn rETH to receive ETH', action: 'Unstake rETH' },
			{ name: 'Get Staking APR', value: 'getStakingApr', description: 'Get current staking APR', action: 'Get staking APR' },
			{ name: 'Get Total Staked', value: 'getTotalStaked', description: 'Get total ETH staked in protocol', action: 'Get total staked' },
			{ name: 'Get Pool Balance', value: 'getPoolBalance', description: 'Get deposit pool balance', action: 'Get pool balance' },
			{ name: 'Get Queue Status', value: 'getQueueStatus', description: 'Get minipool queue status', action: 'Get queue status' },
			{ name: 'Estimate Stake Gas', value: 'estimateStakeGas', description: 'Estimate gas for staking', action: 'Estimate stake gas' },
		],
		default: 'getRethBalance',
	},
];

export const stakingFields: INodeProperties[] = [
	// Stake ETH fields
	{
		displayName: 'Amount (ETH)',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.0',
		description: 'Amount of ETH to stake',
		displayOptions: { show: { resource: ['staking'], operation: ['stakeEth', 'estimateStakeGas'] } },
	},
	// Balance/query fields
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Ethereum address to query',
		displayOptions: { show: { resource: ['staking'], operation: ['getRethBalance'] } },
	},
	// rETH amount for conversion
	{
		displayName: 'rETH Amount',
		name: 'rethAmount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.0',
		description: 'Amount of rETH',
		displayOptions: { show: { resource: ['staking'], operation: ['getEthValue', 'unstakeReth'] } },
	},
	// APR calculation period
	{
		displayName: 'Period (Days)',
		name: 'period',
		type: 'number',
		default: 30,
		description: 'Period in days for APR calculation',
		displayOptions: { show: { resource: ['staking'], operation: ['getStakingApr'] } },
	},
];

export async function executeStakingOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'stakeEth': {
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.stakeEth(amount);
			result = {
				transactionHash: tx.hash,
				amount,
				status: 'pending',
				message: `Staking ${amount} ETH for rETH`,
			};
			break;
		}

		case 'getRethBalance': {
			const address = this.getNodeParameter('address', index) as string;
			const balance = await client.getRethBalance(address);
			const rate = await client.getRethExchangeRate();
			result = {
				address,
				rethBalance: balance,
				ethValue: rethToEth(parseFloat(balance), parseFloat(rate)).toString(),
				exchangeRate: rate,
			};
			break;
		}

		case 'getExchangeRate': {
			const rate = await client.getRethExchangeRate();
			const rethForOneEth = ethToReth(1, parseFloat(rate));
			result = {
				exchangeRate: rate,
				ethPerReth: rate,
				rethPerEth: rethForOneEth.toString(),
			};
			break;
		}

		case 'getEthValue': {
			const rethAmount = this.getNodeParameter('rethAmount', index) as string;
			const ethValue = await client.getRethToEth(rethAmount);
			result = {
				rethAmount,
				ethValue,
			};
			break;
		}

		case 'unstakeReth': {
			const rethAmount = this.getNodeParameter('rethAmount', index) as string;
			const burnEnabled = await client.getBurnEnabled();
			if (!burnEnabled) {
				throw new Error('rETH burning is currently disabled. Use DEX to swap.');
			}
			const tx = await client.burnReth(rethAmount);
			result = {
				transactionHash: tx.hash,
				rethBurned: rethAmount,
				status: 'pending',
			};
			break;
		}

		case 'getStakingApr': {
			const rate = await client.getRethExchangeRate();
			const apr = calculateRethApr(1.0, parseFloat(rate), 365);
			result = {
				apr: apr.toFixed(4),
				aprPercent: `${(apr * 100).toFixed(2)}%`,
				currentRate: rate,
			};
			break;
		}

		case 'getTotalStaked': {
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();
			const rate = await client.getRethExchangeRate();
			const totalEth = rethToEth(parseFloat(client.formatEth(totalSupply)), parseFloat(rate));
			result = {
				totalRethSupply: client.formatEth(totalSupply),
				totalEthStaked: totalEth.toString(),
				exchangeRate: rate,
			};
			break;
		}

		case 'getPoolBalance': {
			const balance = await client.getDepositPoolBalance();
			result = {
				depositPoolBalance: balance,
				balanceEth: balance,
			};
			break;
		}

		case 'getQueueStatus': {
			const minipoolManager = client.getMinipoolManagerContract();
			const count = await client.getMinipoolCount();
			result = {
				totalMinipools: count,
				queueInfo: 'Query minipool queue for detailed status',
			};
			break;
		}

		case 'estimateStakeGas': {
			const amount = this.getNodeParameter('amount', index) as string;
			const gasEstimate = await client.estimateGas('stake', amount);
			const gasPrice = await client.getGasPrice();
			result = {
				gasEstimate: gasEstimate.toString(),
				gasPrice,
				estimatedCost: (parseFloat(gasEstimate.toString()) * parseFloat(gasPrice) / 1e9).toFixed(6),
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
