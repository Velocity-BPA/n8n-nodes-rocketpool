/**
 * Utility Resource Operations
 * Utility functions for Rocket Pool operations
 *
 * [Velocity BPA Licensing Notice]
 * This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { createRocketPoolClient } from '../../transport/rocketPoolClient';
import { ethToReth, rethToEth, calculateRethApr, aprToApy } from '../../utils/rethUtils';
import { isValidPubkey, isValidWithdrawalCredentials } from '../../utils/validatorUtils';
import { CONTRACT_ADDRESSES, NETWORKS } from '../../constants';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['utility'] } },
		options: [
			{ name: 'Convert ETH to rETH', value: 'ethToReth', description: 'Calculate rETH for ETH amount', action: 'Convert ETH to rETH' },
			{ name: 'Convert rETH to ETH', value: 'rethToEth', description: 'Calculate ETH for rETH amount', action: 'Convert rETH to ETH' },
			{ name: 'Calculate APR', value: 'calculateApr', description: 'Calculate staking APR', action: 'Calculate APR' },
			{ name: 'Validate Address', value: 'validateAddress', description: 'Validate Ethereum address', action: 'Validate address' },
			{ name: 'Validate Pubkey', value: 'validatePubkey', description: 'Validate validator public key', action: 'Validate pubkey' },
			{ name: 'Get Contract ABI', value: 'getAbi', description: 'Get contract ABI', action: 'Get contract ABI' },
			{ name: 'Estimate Gas', value: 'estimateGas', description: 'Estimate transaction gas', action: 'Estimate gas' },
			{ name: 'Get Network Status', value: 'getNetworkStatus', description: 'Get network connection status', action: 'Get network status' },
			{ name: 'Get Block Number', value: 'getBlockNumber', description: 'Get current block number', action: 'Get block number' },
		],
		default: 'ethToReth',
	},
];

export const utilityFields: INodeProperties[] = [
	{
		displayName: 'ETH Amount',
		name: 'ethAmount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.0',
		description: 'Amount of ETH',
		displayOptions: { show: { resource: ['utility'], operation: ['ethToReth'] } },
	},
	{
		displayName: 'rETH Amount',
		name: 'rethAmount',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1.0',
		description: 'Amount of rETH',
		displayOptions: { show: { resource: ['utility'], operation: ['rethToEth'] } },
	},
	{
		displayName: 'Address',
		name: 'address',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Ethereum address to validate',
		displayOptions: { show: { resource: ['utility'], operation: ['validateAddress'] } },
	},
	{
		displayName: 'Public Key',
		name: 'pubkey',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0x...',
		description: 'Validator public key to validate',
		displayOptions: { show: { resource: ['utility'], operation: ['validatePubkey'] } },
	},
	{
		displayName: 'Contract',
		name: 'contractName',
		type: 'options',
		options: [
			{ name: 'rETH', value: 'reth' },
			{ name: 'RPL', value: 'rpl' },
			{ name: 'Deposit Pool', value: 'depositPool' },
			{ name: 'Node Manager', value: 'nodeManager' },
			{ name: 'Minipool Manager', value: 'minipoolManager' },
		],
		default: 'reth',
		description: 'Contract to get ABI for',
		displayOptions: { show: { resource: ['utility'], operation: ['getAbi'] } },
	},
	{
		displayName: 'Operation Type',
		name: 'gasOperationType',
		type: 'options',
		options: [
			{ name: 'Stake ETH', value: 'stake' },
			{ name: 'Burn rETH', value: 'burn' },
			{ name: 'Transfer', value: 'transfer' },
			{ name: 'Approve', value: 'approve' },
		],
		default: 'stake',
		description: 'Operation to estimate gas for',
		displayOptions: { show: { resource: ['utility'], operation: ['estimateGas'] } },
	},
	{
		displayName: 'Amount',
		name: 'gasAmount',
		type: 'string',
		default: '1.0',
		description: 'Amount for gas estimation',
		displayOptions: { show: { resource: ['utility'], operation: ['estimateGas'] } },
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	const credentials = await this.getCredentials('rocketPoolNetwork');
	const client = createRocketPoolClient(credentials);

	let result: Record<string, unknown>;

	switch (operation) {
		case 'ethToReth': {
			const ethAmount = this.getNodeParameter('ethAmount', index) as string;
			const rate = await client.getRethExchangeRate();
			const rethAmount = ethToReth(parseFloat(ethAmount), parseFloat(rate));
			
			result = {
				ethAmount,
				rethAmount: rethAmount.toString(),
				exchangeRate: rate,
			};
			break;
		}

		case 'rethToEth': {
			const rethAmount = this.getNodeParameter('rethAmount', index) as string;
			const rate = await client.getRethExchangeRate();
			const ethAmount = rethToEth(parseFloat(rethAmount), parseFloat(rate));
			
			result = {
				rethAmount,
				ethAmount: ethAmount.toString(),
				exchangeRate: rate,
			};
			break;
		}

		case 'calculateApr': {
			const rate = await client.getRethExchangeRate();
			const apr = calculateRethApr(1.0, parseFloat(rate), 365);
			const apy = aprToApy(apr);
			
			result = {
				apr: apr.toFixed(6),
				aprPercent: `${(apr * 100).toFixed(2)}%`,
				apy: apy.toFixed(6),
				apyPercent: `${(apy * 100).toFixed(2)}%`,
				currentRate: rate,
			};
			break;
		}

		case 'validateAddress': {
			const address = this.getNodeParameter('address', index) as string;
			const isValid = client.isValidAddress(address);
			
			result = {
				address,
				valid: isValid,
				checksumAddress: isValid ? address : null,
			};
			break;
		}

		case 'validatePubkey': {
			const pubkey = this.getNodeParameter('pubkey', index) as string;
			const isValid = isValidPubkey(pubkey);
			
			result = {
				pubkey,
				valid: isValid,
				length: pubkey.length,
				expectedLength: 98,
			};
			break;
		}

		case 'getAbi': {
			const contractName = this.getNodeParameter('contractName', index) as string;
			
			result = {
				contract: contractName,
				message: 'ABI available in constants/contracts.ts',
				description: 'Use contract ABIs from the constants module',
			};
			break;
		}

		case 'estimateGas': {
			const gasOperationType = this.getNodeParameter('gasOperationType', index) as string;
			const gasAmount = this.getNodeParameter('gasAmount', index) as string;
			
			const gasEstimate = await client.estimateGas(gasOperationType, gasAmount);
			const gasPrice = await client.getGasPrice();
			const estimatedCost = (parseFloat(gasEstimate.toString()) * parseFloat(gasPrice) / 1e9);
			
			result = {
				operation: gasOperationType,
				gasEstimate: gasEstimate.toString(),
				gasPrice,
				estimatedCostEth: estimatedCost.toFixed(6),
			};
			break;
		}

		case 'getNetworkStatus': {
			const blockNumber = await client.getBlockNumber();
			const gasPrice = await client.getGasPrice();
			
			result = {
				connected: true,
				blockNumber,
				gasPrice,
				network: credentials.network || 'mainnet',
			};
			break;
		}

		case 'getBlockNumber': {
			const blockNumber = await client.getBlockNumber();
			
			result = {
				blockNumber,
				timestamp: Date.now(),
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: result }];
}
