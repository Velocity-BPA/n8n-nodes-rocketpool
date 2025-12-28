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
 * Rocket Pool API Credentials
 *
 * Provides API endpoints for querying Rocket Pool data through
 * REST APIs and The Graph subgraph.
 */
export class RocketPoolApi implements ICredentialType {
  name = 'rocketPoolApi';
  displayName = 'Rocket Pool API';
  documentationUrl = 'https://docs.rocketpool.net/';

  properties: INodeProperties[] = [
    {
      displayName: 'Rocket Pool API Endpoint',
      name: 'apiEndpoint',
      type: 'string',
      default: 'https://api.rocketpool.net',
      description: 'The Rocket Pool API endpoint for protocol statistics and data',
      required: true,
    },
    {
      displayName: 'Subgraph URL',
      name: 'subgraphUrl',
      type: 'string',
      default: '',
      placeholder: 'https://gateway.thegraph.com/api/YOUR-API-KEY/subgraphs/id/...',
      description: 'The Graph subgraph URL for querying Rocket Pool indexed data',
    },
    {
      displayName: 'The Graph API Key',
      name: 'graphApiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Optional: API key for The Graph hosted service or decentralized network',
    },
    {
      displayName: 'Beacon Chain API URL',
      name: 'beaconApiUrl',
      type: 'string',
      default: '',
      placeholder: 'https://beacon.example.com',
      description: 'Optional: Beacon Chain API endpoint for validator data',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiEndpoint}}',
      url: '/api/mainnet/stats',
      method: 'GET',
    },
  };
}
