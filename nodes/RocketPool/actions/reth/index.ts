/**
 * rETH Resource Operations
 * Manage rETH liquid staking token
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { rethToEth, calculateRethApr, calculateCollateralRatio } from '../../utils/rethUtils';

export const rethOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['reth'] } },
		options: [
			{ name: 'Get rETH Info', value: 'getInfo', description: 'Get comprehensive rETH token info', action: 'Get rETH info' },
			{ name: 'Get Balance', value: 'getBalance', description: 'Get rETH balance for address', action: 'Get balance' },
			{ name: 'Get Total Supply', value: 'getTotalSupply', description: 'Get total rETH supply', action: 'Get total supply' },
			{ name: 'Get Exchange Rate', value: 'getExchangeRate', description: 'Get ETH/rETH exchange rate', action: 'Get exchange rate' },
			{ name: 'Get Burn Enabled', value: 'getBurnEnabled', description: 'Check if rETH burning is enabled', action: 'Get burn enabled' },
			{ name: 'Get Collateral Rate', value: 'getCollateralRate', description: 'Get rETH collateral ratio', action: 'Get collateral rate' },
			{ name: 'Transfer rETH', value: 'transfer', description: 'Transfer rETH to another address', action: 'Transfer rETH' },
			{ name: 'Approve rETH', value: 'approve', description: 'Approve rETH spending', action: 'Approve rETH' },
			{ name: 'Get APR', value: 'getApr', description: 'Get current rETH staking APR', action: 'Get APR' },
			{ name: 'Get ETH Value', value: 'getEthValue', description: 'Get ETH value of rETH', action: 'Get ETH value' },
		],
		default: 'getInfo',
	},
];

export const rethFields: INodeProperties[] = [
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Ethereum address',
		displayOptions: { show: { resource: ['reth'], operation: ['getBalance'] } },
	},
	{
		displayName: 'To Address',
		name: 'toAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Recipient address',
		displayOptions: { show: { resource: ['reth'], operation: ['transfer'] } },
	},
	{
		displayName: 'Spender Address',
		name: 'spenderAddress',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Spender address to approve',
		displayOptions: { show: { resource: ['reth'], operation: ['approve'] } },
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.0',
		description: 'Amount of rETH',
		displayOptions: { show: { resource: ['reth'], operation: ['transfer', 'approve', 'getEthValue'] } },
	},
];

export async function executeRethOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'getInfo': {
			const rate = await client.getRethExchangeRate();
			const collateral = await client.getCollateralRate();
			const burnEnabled = await client.getBurnEnabled();
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();

			result = {
				exchangeRate: rate,
				collateralRate: collateral,
				burnEnabled,
				totalSupply: client.formatEth(totalSupply),
				totalEthBacking: rethToEth(parseFloat(client.formatEth(totalSupply)), parseFloat(rate)).toString(),
			};
			break;
		}

		case 'getBalance': {
			const address = this.getNodeParameter('address', index) as string;
			const balance = await client.getRethBalance(address);
			const rate = await client.getRethExchangeRate();
			result = {
				address,
				rethBalance: balance,
				ethValue: rethToEth(parseFloat(balance), parseFloat(rate)).toString(),
			};
			break;
		}

		case 'getTotalSupply': {
			const rethContract = client.getRethContract();
			const totalSupply = await rethContract.totalSupply();
			result = {
				totalSupply: client.formatEth(totalSupply),
				totalSupplyWei: totalSupply.toString(),
			};
			break;
		}

		case 'getExchangeRate': {
			const rate = await client.getRethExchangeRate();
			result = {
				exchangeRate: rate,
				ethPerReth: rate,
				description: '1 rETH = ' + rate + ' ETH',
			};
			break;
		}

		case 'getBurnEnabled': {
			const burnEnabled = await client.getBurnEnabled();
			result = { burnEnabled, message: burnEnabled ? 'rETH burning is enabled' : 'rETH burning is disabled' };
			break;
		}

		case 'getCollateralRate': {
			const collateral = await client.getCollateralRate();
			const collateralPercent = (parseFloat(collateral) * 100).toFixed(2);
			result = {
				collateralRate: collateral,
				collateralPercent: `${collateralPercent}%`,
				healthy: parseFloat(collateral) >= 1.0,
			};
			break;
		}

		case 'transfer': {
			const toAddress = this.getNodeParameter('toAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.transferReth(toAddress, amount);
			result = { transactionHash: tx.hash, to: toAddress, amount, status: 'pending' };
			break;
		}

		case 'approve': {
			const spenderAddress = this.getNodeParameter('spenderAddress', index) as string;
			const amount = this.getNodeParameter('amount', index) as string;
			const tx = await client.approveReth(spenderAddress, amount);
			result = { transactionHash: tx.hash, spender: spenderAddress, amount, status: 'pending' };
			break;
		}

		case 'getApr': {
			const rate = await client.getRethExchangeRate();
			const apr = calculateRethApr(1.0, parseFloat(rate), 365);
			result = { apr: apr.toFixed(4), aprPercent: `${(apr * 100).toFixed(2)}%` };
			break;
		}

		case 'getEthValue': {
			const amount = this.getNodeParameter('amount', index) as string;
			const ethValue = await client.getRethToEth(amount);
			result = { rethAmount: amount, ethValue };
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
