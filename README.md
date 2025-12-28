# n8n-nodes-rocketpool

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the Rocket Pool decentralized ETH staking protocol. This package provides 20 resources with 200+ operations for liquid staking, node operations, minipools, RPL governance, rewards management, and protocol analytics.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Rocket Pool](https://img.shields.io/badge/Rocket%20Pool-ETH%20Staking-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **Liquid Staking**: Stake ETH for rETH, track exchange rates, monitor APR
- **rETH Management**: Full rETH token operations including transfers and approvals
- **Node Operator Tools**: Register nodes, manage minipools, stake RPL
- **Minipool Operations**: Create, monitor, and manage validator minipools
- **RPL Token**: Stake, unstake, and track RPL collateral requirements
- **Rewards System**: Claim rewards, verify merkle proofs, track intervals
- **Smoothing Pool**: Opt-in/out management and reward tracking
- **DAO Integration**: Protocol DAO and Oracle DAO queries
- **Auction Monitoring**: Track RPL auctions and bidding
- **Beacon Chain**: Validator status and performance tracking
- **Analytics**: TVL, APR history, and protocol statistics
- **Subgraph Queries**: Custom GraphQL queries against Rocket Pool subgraph
- **Trigger Node**: Real-time event monitoring for staking, nodes, minipools, rewards

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-rocketpool`
5. Accept the risks and click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-rocketpool

# Restart n8n
```

### Development Installation

```bash
# Clone or extract the package
git clone https://github.com/Velocity-BPA/n8n-nodes-rocketpool.git
cd n8n-nodes-rocketpool

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-rocketpool

# Restart n8n
n8n start
```

## Credentials Setup

### Rocket Pool Network Credentials (Required)

| Field | Description | Required |
|-------|-------------|----------|
| Network | Mainnet, Holesky, or Custom | Yes |
| Execution RPC URL | Ethereum execution layer RPC endpoint | Yes |
| Consensus RPC URL | Beacon chain consensus layer endpoint | Yes |
| Private Key | Wallet private key for transactions | No |
| Chain ID | Network chain ID (auto-populated) | No |
| Subgraph URL | Custom subgraph endpoint | No |

### Rocket Pool Operator Credentials (Optional)

| Field | Description | Required |
|-------|-------------|----------|
| Node Address | Registered node operator address | Yes |
| Node Private Key | Node wallet private key | Yes |
| Withdrawal Address | Address for withdrawals | No |
| Fee Recipient | MEV/priority fee recipient | No |

### Rocket Pool API Credentials (Optional)

| Field | Description | Required |
|-------|-------------|----------|
| API Endpoint | Rocket Pool API URL | No |
| Subgraph URL | Rocket Pool subgraph endpoint | Yes |

## Resources & Operations

### 1. Staking
Liquid staking operations for ETH/rETH.

| Operation | Description |
|-----------|-------------|
| Stake ETH | Deposit ETH to receive rETH |
| Get rETH Balance | Check rETH balance for address |
| Get Exchange Rate | Current rETH/ETH exchange rate |
| Get ETH Value | Convert rETH amount to ETH value |
| Unstake rETH | Burn rETH to receive ETH |
| Get Staking APR | Current staking annual percentage rate |
| Get Total Staked | Total ETH staked in protocol |
| Get Pool Balance | Current deposit pool balance |
| Get Queue Status | Deposit queue status |
| Estimate Stake Gas | Estimate gas for stake transaction |

### 2. rETH
rETH token management operations.

| Operation | Description |
|-----------|-------------|
| Get Info | rETH token information |
| Get Balance | rETH balance for address |
| Get Total Supply | Total rETH in circulation |
| Get Exchange Rate | Current exchange rate |
| Get Burn Enabled | Check if burning is enabled |
| Get Collateral Rate | rETH collateralization ratio |
| Transfer | Transfer rETH to address |
| Approve | Approve rETH spending |
| Get APR | Current rETH APR |
| Get ETH Value | rETH value in ETH |

### 3. Node Operator
Node operator management functions.

| Operation | Description |
|-----------|-------------|
| Register Node | Register as node operator |
| Get Node Details | Full node information |
| Get Node Fee | Node commission rate |
| Get RPL Stake | RPL staked by node |
| Get Effective RPL Stake | RPL counting for rewards |
| Get Node Minipools | List node's minipools |
| Get Pending Rewards | Unclaimed rewards |
| Get Timezone | Node timezone setting |
| Set Withdrawal Address | Update withdrawal address |
| Get Smoothing Pool Status | Smoothing pool opt-in status |
| Set Smoothing Pool Status | Opt in/out of smoothing pool |
| Check Node Exists | Verify node registration |

### 4. Minipool
Validator minipool operations.

| Operation | Description |
|-----------|-------------|
| Get Minipool | Single minipool details |
| List Minipools | All minipools for node/address |
| Get Status | Minipool status |
| Get Balance | Minipool ETH balance |
| Get Node Fee | Minipool commission |
| Get Deposit Type | LEB8/Full deposit type |
| Dissolve | Dissolve minipool |
| Close | Close exited minipool |
| Distribute Balance | Distribute validator rewards |
| Get Minipool Count | Total protocol minipools |
| Get Node Minipool Count | Node's minipool count |
| Get Queue Length | Minipool queue length |

### 5. RPL
RPL token and staking operations.

| Operation | Description |
|-----------|-------------|
| Get Balance | RPL balance for address |
| Get Price | Current RPL/ETH price |
| Get Total Supply | Total RPL supply |
| Stake RPL | Stake RPL as collateral |
| Unstake RPL | Unstake RPL from node |
| Get Staked RPL | Node's staked RPL |
| Get Effective Stake | RPL counting for rewards |
| Get Minimum Stake | Minimum required RPL |
| Get Maximum Stake | Maximum effective RPL |
| Transfer RPL | Transfer RPL tokens |
| Approve RPL | Approve RPL spending |

### 6. Rewards
Reward claiming and tracking.

| Operation | Description |
|-----------|-------------|
| Get Claimable | Claimable rewards amount |
| Claim Rewards | Claim pending rewards |
| Get Intervals | Reward interval information |
| Get Snapshot | Reward snapshot data |
| Get Node Claims | Node's claim history |
| Check Claimed | Check if interval claimed |
| Get Unclaimed | Unclaimed intervals |
| Get Smoothing Pool Rewards | Smoothing pool earnings |

### 7. Deposit Pool
Deposit pool monitoring.

| Operation | Description |
|-----------|-------------|
| Get Balance | Current pool balance |
| Get Capacity | Maximum pool capacity |
| Get Max Deposit | Maximum single deposit |
| Get Deposit Enabled | Deposits enabled status |
| Get Pool Status | Full pool status |

### 8. Network
Protocol network statistics.

| Operation | Description |
|-----------|-------------|
| Get Stats | Protocol statistics overview |
| Get Node Count | Total registered nodes |
| Get Minipool Count | Total minipools |
| Get Total Staked | Total ETH staked |
| Get rETH APR | Current rETH APR |
| Get Version | Protocol version |
| Get Contracts | Contract addresses |
| Get Network Info | Network configuration |

### 9. DAO
DAO governance overview.

| Operation | Description |
|-----------|-------------|
| Get Overview | DAO overview information |
| Get Protocol DAO | pDAO details |
| Get Oracle DAO | oDAO details |
| Get Security Council | Security council info |

### 10. Oracle DAO
Oracle DAO (oDAO) operations.

| Operation | Description |
|-----------|-------------|
| Get Members | List oDAO members |
| Check Member | Verify oDAO membership |
| Get Member Bond | Member's RPL bond |
| Get Quorum | Current quorum requirement |
| Get Settings | oDAO settings |

### 11. Protocol DAO
Protocol DAO (pDAO) settings.

| Operation | Description |
|-----------|-------------|
| Get Settings | All pDAO settings |
| Get Inflation Settings | RPL inflation config |
| Get Reward Settings | Reward distribution config |
| Get Minipool Settings | Minipool requirements |
| Get Node Settings | Node requirements |
| Get Deposit Settings | Deposit pool config |

### 12. Auction
RPL auction operations.

| Operation | Description |
|-----------|-------------|
| Get Active | Active auction lots |
| Get Lot | Specific lot details |
| Place Bid | Bid on auction lot |
| Claim Lot | Claim won lot |
| Get Settings | Auction settings |
| Get History | Auction history |

### 13. Smoothing Pool
MEV smoothing pool operations.

| Operation | Description |
|-----------|-------------|
| Get Balance | Pool total balance |
| Get Node Status | Node's pool status |
| Opt In | Join smoothing pool |
| Opt Out | Leave smoothing pool |
| Get Pool Info | Pool information |

### 14. Merkle Rewards
Merkle reward tree operations.

| Operation | Description |
|-----------|-------------|
| Get Merkle Root | Current merkle root |
| Get Merkle Proof | Proof for claiming |
| Verify Proof | Verify merkle proof |
| Get Rewards File | Download rewards file |
| Get Interval Info | Interval details |
| Get Claimed Status | Check claim status |

### 15. Beacon Chain
Consensus layer operations.

| Operation | Description |
|-----------|-------------|
| Get Validator | Validator information |
| Get Balance | Validator balance |
| Get Status | Validator status |
| Get Sync Committee | Sync committee duties |
| Get Genesis | Genesis information |
| Get Finality | Finality checkpoints |
| Get Health | Beacon node health |

### 16. Prices
Price oracle operations.

| Operation | Description |
|-----------|-------------|
| Get RPL Price | Current RPL/ETH price |
| Get rETH Rate | Current rETH rate |
| Get All Prices | All price data |
| Get Price Block | Last price update block |

### 17. Inflation
RPL inflation tracking.

| Operation | Description |
|-----------|-------------|
| Get Rate | Annual inflation rate |
| Get RPL Per Day | Daily RPL inflation |
| Get Info | Full inflation info |

### 18. Analytics
Protocol analytics and statistics.

| Operation | Description |
|-----------|-------------|
| Get TVL | Total value locked |
| Get Stats | Protocol statistics |
| Get Node Stats | Node statistics |
| Get Minipool Stats | Minipool statistics |
| Get Staking Stats | Staking statistics |
| Get APR History | Historical APR data |

### 19. Subgraph
GraphQL subgraph queries.

| Operation | Description |
|-----------|-------------|
| Query Nodes | Query node operators |
| Query Minipools | Query minipools |
| Query Stakers | Query rETH stakers |
| Query Rewards | Query reward claims |
| Custom Query | Execute custom GraphQL |
| Get Status | Subgraph sync status |
| Search Nodes | Search nodes by criteria |

### 20. Utility
Helper functions and utilities.

| Operation | Description |
|-----------|-------------|
| ETH to rETH | Convert ETH to rETH amount |
| rETH to ETH | Convert rETH to ETH amount |
| Calculate APR | Calculate annual percentage rate |
| Validate Address | Validate Ethereum address |
| Validate Pubkey | Validate validator pubkey |
| Get ABI | Get contract ABI |
| Estimate Gas | Estimate transaction gas |
| Get Network Status | Network status check |
| Get Block Number | Current block number |

## Trigger Node

The **Rocket Pool Trigger** node monitors real-time events with configurable polling.

### Event Categories

| Category | Events |
|----------|--------|
| Staking | ETH staked, rETH burned, rate changed |
| rETH | Minted, burned, transferred |
| Node | Registered, fee changed, withdrawal set |
| Minipool | Created, staked, dissolved, closed |
| RPL | Staked, unstaked, slashed, price updated |
| Rewards | Available, claimed, new interval |
| DAO | Proposal created, votes cast |
| Auction | Started, bid placed, lot claimed |

## Usage Examples

### Stake ETH for rETH

```json
{
  "nodes": [
    {
      "name": "Rocket Pool",
      "type": "n8n-nodes-rocketpool.rocketPool",
      "parameters": {
        "resource": "staking",
        "operation": "stakeEth",
        "amount": "1.0"
      }
    }
  ]
}
```

### Monitor Node Rewards

```json
{
  "nodes": [
    {
      "name": "Check Rewards",
      "type": "n8n-nodes-rocketpool.rocketPool",
      "parameters": {
        "resource": "rewards",
        "operation": "getClaimable",
        "nodeAddress": "0x..."
      }
    }
  ]
}
```

### Track rETH Exchange Rate

```json
{
  "nodes": [
    {
      "name": "Rocket Pool Trigger",
      "type": "n8n-nodes-rocketpool.rocketPoolTrigger",
      "parameters": {
        "eventCategory": "staking",
        "eventType": "exchangeRateChanged",
        "pollInterval": 300
      }
    }
  ]
}
```

## Rocket Pool Concepts

### rETH (Rocket Pool ETH)
A liquid staking token representing staked ETH. rETH accrues value over time as validators earn rewards, meaning 1 rETH is worth progressively more ETH.

### RPL (Rocket Pool Token)
The protocol's governance and collateral token. Node operators must stake RPL as insurance against slashing events.

### Minipools
Smart contracts that pair node operator ETH (8 or 16 ETH) with staker ETH to create validators. Types:
- **LEB8**: 8 ETH bond (Lower ETH Bond)
- **Full**: 16 ETH bond

### Node Operator
Users who run validators for the protocol. They stake their own ETH plus RPL collateral and receive commission from staker rewards.

### Node Fee
Commission rate (5-20%) that node operators earn on rewards generated from staker ETH.

### Effective RPL Stake
The portion of staked RPL that counts toward rewards, capped at 150% of borrowed ETH value.

### Smoothing Pool
Optional pool where node operators share MEV and priority fees equally rather than receiving them individually.

### Oracle DAO (oDAO)
Trusted node operators who submit price updates, reward merkle roots, and consensus layer data to the protocol.

### Protocol DAO (pDAO)
On-chain governance system controlling protocol parameters through RPL-weighted voting.

### Deposit Pool
Queue where staker ETH waits before being matched with node operators to create validators.

### Merkle Rewards
Reward distribution system using merkle trees for efficient batch claiming across multiple intervals.

## Networks

| Network | Chain ID | Description |
|---------|----------|-------------|
| Mainnet | 1 | Ethereum mainnet (production) |
| Holesky | 17000 | Ethereum testnet |
| Custom | - | Custom RPC endpoints |

## Error Handling

The node implements comprehensive error handling:

- **RPC Errors**: Connection failures, rate limits, timeout handling
- **Contract Errors**: Reverts, insufficient funds, invalid parameters
- **Validation Errors**: Address format, amounts, pubkey format
- **Continue on Fail**: Optionally continue workflow on node errors

## Security Best Practices

1. **Private Keys**: Never log or expose private keys. Use secure credential storage.
2. **Testnet First**: Always test with Holesky testnet before mainnet transactions.
3. **Gas Estimation**: Always estimate gas before submitting transactions.
4. **Address Validation**: Validate all addresses before operations.
5. **Amount Validation**: Verify amounts are within expected ranges.
6. **Withdrawal Addresses**: Double-check withdrawal addresses before setting.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Fix lint issues
npm run lint:fix

# Watch mode
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-rocketpool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Velocity-BPA/n8n-nodes-rocketpool/discussions)
- **Email**: support@velobpa.com

## Acknowledgments

- [Rocket Pool](https://rocketpool.net) - Decentralized ETH staking protocol
- [n8n](https://n8n.io) - Workflow automation platform
- [ethers.js](https://ethers.org) - Ethereum library
