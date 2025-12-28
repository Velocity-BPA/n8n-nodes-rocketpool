/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Rocket Pool Network Credentials
 *
 * Provides network configuration for connecting to Rocket Pool protocol
 * on Ethereum mainnet, Holesky testnet, or custom endpoints.
 */
export class RocketPoolNetwork implements ICredentialType {
  name = 'rocketPoolNetwork';
  displayName = 'Rocket Pool Network';
  documentationUrl = 'https://docs.rocketpool.net/';

  properties: INodeProperties[] = [
    {
      displayName: 'Network',
      name: 'network',
      type: 'options',
      options: [
        {
          name: 'Ethereum Mainnet',
          value: 'mainnet',
        },
        {
          name: 'Ethereum Holesky (Testnet)',
          value: 'holesky',
        },
        {
          name: 'Custom Endpoint',
          value: 'custom',
        },
      ],
      default: 'mainnet',
      description: 'The Ethereum network to connect to',
    },
    {
      displayName: 'Execution Layer RPC URL',
      name: 'executionRpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
      description: 'The execution layer (Eth1) RPC endpoint URL',
      required: true,
    },
    {
      displayName: 'Consensus Layer RPC URL',
      name: 'consensusRpcUrl',
      type: 'string',
      default: '',
      placeholder: 'https://beacon.example.com',
      description: 'The consensus layer (Beacon Chain) RPC endpoint URL. Required for validator operations.',
    },
    {
      displayName: 'Private Key',
      name: 'privateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The private key for signing transactions (without 0x prefix). Leave empty for read-only operations.',
    },
    {
      displayName: 'Chain ID',
      name: 'chainId',
      type: 'number',
      default: 1,
      description: 'The chain ID of the network. Auto-populated based on network selection (1 for mainnet, 17000 for Holesky).',
      displayOptions: {
        show: {
          network: ['custom'],
        },
      },
    },
    {
      displayName: 'Subgraph Endpoint',
      name: 'subgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://gateway.thegraph.com/api/YOUR-API-KEY/subgraphs/id/...',
      description: 'Optional: The Graph subgraph endpoint for Rocket Pool data queries',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.executionRpcUrl}}',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: 1,
      }),
    },
  };
}
