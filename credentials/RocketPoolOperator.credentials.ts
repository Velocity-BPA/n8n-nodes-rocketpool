/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IAuthenticateGeneric,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

/**
 * Rocket Pool Node Operator Credentials
 *
 * Provides credentials for node operators running Rocket Pool validators.
 * These credentials are required for node registration, minipool creation,
 * and other operator-specific operations.
 */
export class RocketPoolOperator implements ICredentialType {
  name = 'rocketPoolOperator';
  displayName = 'Rocket Pool Node Operator';
  documentationUrl = 'https://docs.rocketpool.net/guides/node/';

  properties: INodeProperties[] = [
    {
      displayName: 'Node Wallet Address',
      name: 'nodeAddress',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'The Ethereum address of the node operator wallet',
      required: true,
    },
    {
      displayName: 'Node Private Key',
      name: 'nodePrivateKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The private key for the node operator wallet (without 0x prefix). Required for transactions.',
      required: true,
    },
    {
      displayName: 'Withdrawal Address',
      name: 'withdrawalAddress',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'The address where staking rewards and withdrawn funds will be sent. Can be different from node address.',
    },
    {
      displayName: 'Fee Recipient Address',
      name: 'feeRecipient',
      type: 'string',
      default: '',
      placeholder: '0x...',
      description: 'Optional: The address to receive priority fees and MEV. If not set, uses the Smoothing Pool or node address.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {},
  };
}
