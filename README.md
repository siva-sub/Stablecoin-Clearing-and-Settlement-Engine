# SCSE: Stablecoin Clearing & Settlement Engine

![License](https://img.shields.io/badge/license-MIT-blue)
![Build](https://img.shields.io/badge/build-passing-green)
![Demo](https://img.shields.io/badge/demo-live-orange)
![Sepolia](https://img.shields.io/badge/network-Sepolia_Testnet-dimgray)

A portfolio-grade financial infrastructure project implementing a **Hybrid Clearing & Settlement Engine** for Stablecoins. 

It demonstrates how modern payment systems can combine the **speed of off-chain ledgers** (RTGS/Netting) with the **trust and finality of on-chain settlement** (Ethereum/ERC-20).

## 🚀 **[Launch Live Demo](https://siva-sub.github.io/Stablecoin-Clearing-and-Settlement-Engine/)**

---

## 🔗 Smart Contract Verification (Sepolia)

The Settlement Engine is deployed live on the Sepolia Testnet. You can verify the source code and view live settlement batches below:

| Component | Address | Link |
| :--- | :--- | :--- |
| **Settlement Contract** | `0x27BeFc27e515DA31378e1DA20343134c1939f55a` | [View Source on Etherscan](https://sepolia.etherscan.io/address/0x27BeFc27e515DA31378e1DA20343134c1939f55a#code) |
| **Mock USDC Token** | `0x4D2C70FF3f02D91afB1872FE2595e609965D775a` | [View Token on Etherscan](https://sepolia.etherscan.io/address/0x4D2C70FF3f02D91afB1872FE2595e609965D775a#code) |
| **Demo Wallet Activity** | *Demo Deployer* | [View Transactions](https://sepolia.etherscan.io/address/0x0cb9cf6c85e96a580a2bf778d141578d4a76e322) |

---

## 📖 Key Scenarios

The demo application (`demo-app/`) walks you through a complete financial lifecycle. 

### 1. High-Frequency Traffic Injection
*   **Action**: Go to **Admin Panel** -> Click **"Inject 10 Transactions"**.
*   **Result**: The system simulates 10 random inter-bank payments. These appear immediately in the **Payment Ledger** with status `CLEARED`.
*   **Concept**: Simulates "RTGS" (Real-Time Gross Settlement) clearing on a private ledger.

### 2. Perfect Netting Circle (Liquidity Optimization)
*   **Action**: Go to **Admin Panel** -> Click **"Inject Circle Scenario"**.
    *   *System injects: A -> B ($100), B -> C ($100), C -> A ($100).*
*   **Action**: Go to **Netting Cycles** -> Click **"Calculate Net Positions"**.
*   **Result**: The engine analyzes the cycle, identifies the circular debt, and produces **Zero Settlement Obligations**.
*   **Concept**: Demonstrates how Multilateral Netting can reduce liquidity requirements by 100%.

### 3. On-Chain Settlement (Web3)
*   **Action**: Connect your MetaMask (Sepolia) wallet.
*   **Action**: In the **Netting Cycles** tab, click **"Settle on Blockchain"**.
*   **Result**: 
    1.  The app constructs a Batch Settlement Transaction.
    2.  You sign it with MetaMask.
    3.  The Smart Contract verifies the batch and moves funds between participants (if any obligations exist).
    4.  The Payment Status updates to `SETTLED` (Finality).

---

## 🏗 Architecture

### Hybrid Model
1.  **Off-Chain Layer (Speed)**: 
    *   **Clearing Engine**: Validates ISO 20022 schemas, enforces compliance checks, handles high-throughput "messaging".
    *   **Netting Engine**: Aggregates obligations to optimize capital efficiency.
2.  **On-Chain Layer await (Trust)**:
    *   **Settlement Contract**: The "Source of Truth" for final funds movement. It only accepts signed batches from authorized operators.

### Tech Stack
*   **Frontend**: React, TypeScript, Vite, Mantine UI.
*   **State Management**: Zustand (Client-side localized database simulation).
*   **Web3**: Wagmi, Viem, MetaMask SDK.
*   **Backend (Reference)**: Python, FastAPI, SQLAlchemy (in `src/` folder - currently powering the logic ported to the frontend).
*   **Contracts**: Solidity, Hardhat.

---

## 🛠 Local Development

### 1. React Demo App
Run the visualization locally:

```bash
cd demo-app
npm install
npm run dev
```

### 2. Smart Contracts
Compile and deploy your own contracts (requires `.env` with `SEPOLIA_RPC_URL` and `PRIVATE_KEY`):

```bash
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## 📚 Documentation
*   [Flow Diagrams](docs/FLOWS.md)
*   [State Machine](docs/STATE_MACHINE.md)
*   [Netting Algorithm](docs/NETTING.md)
*   [ISO 20022 Interoperability](docs/adr/011_iso20022_interoperability.md)

---

## Disclaimer
This is a portfolio project/prototype. It is not audited for mainnet production use. The "USDC" used here is a mock testnet token.
