# Smart Contracts & On-Chain Settlement

SCSE bridges the gap between traditional Clearing Engines and decentralized settlement by leveraging Ethereum-compatible blockchains for finality.

## Deployed Contracts (Sepolia Testnet)

| Contract | Address | Links |
| :--- | :--- | :--- |
| **Settlement Agent** | `0x27BeFc27e515DA31378e1DA20343134c1939f55a` | [Etherscan](https://sepolia.etherscan.io/address/0x27BeFc27e515DA31378e1DA20343134c1939f55a#code) |
| **Mock USDC** | `0x4D2C70FF3f02D91afB1872FE2595e609965D775a` | [Etherscan](https://sepolia.etherscan.io/address/0x4D2C70FF3f02D91afB1872FE2595e609965D775a#code) |
| **Deployer Wallet** | `0x0cB9cf6C85E96a580a2bF778d141578D4A76e322` | [Transactions](https://sepolia.etherscan.io/address/0x0cb9cf6c85e96a580a2bf778d141578d4a76e322) |

---

## Architecture

### 1. MockUSDC (`MockUSDC.sol`)
A standard ERC-20 token used to simulate fiat-backed stablecoins (like Circle's USDC).
- **Decimals**: 6 (Matches real USDC).
- **Features**: Mintable for testing purposes.

### 2. Settlement Agent (`Settlement.sol`)
The core atomic settlement engine. It replaces the need for bilateral bank-to-bank transfers by executing a batch of transfers in a single atomic transaction.

#### Workflow
1.  **Off-Chain Netting**: The SCSE Python backend (or Client Demo) calculates the minimal Net positions.
2.  **Instruction Generation**: A list of `Debits` (Who pays) and `Credits` (Who receives) is generated.
3.  **Approval**: Debtor banks approve the `Settlement` contract to spend their USDC.
4.  **Batch Execution**: The Settlement Agent calls `settleBatch(debtors, amounts, creditors, amounts)`.
    *   **Step A (Harvest)**: The contract uses `transferFrom` to pull funds from all Debtors into itself.
    *   **Step B (Distribute)**: The contract uses `transfer` to push funds to all Creditors.
    *   **Validation**: The transaction `reverts` (fails) if any transfer fails or if the batch is insolvent (Debits < Credits).

## Integration Guide

### Running Locally
The project includes a Hardhat setup for local development.

```bash
cd contracts
npm install
npx hardhat node
npx hardhat test
```

### Verifying on Etherscan
The contracts are currently available as decompiled bytecode. Verification requires an Etherscan API Key via `hardhat.config.js`.
