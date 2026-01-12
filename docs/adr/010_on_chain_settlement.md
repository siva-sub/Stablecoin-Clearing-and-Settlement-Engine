# ADR 010: On-Chain Settlement Mechanism

## Status
Accepted

## Context
SCSE requires a mechanism to finalize net obligations between participants. While the Netting Engine calculates optimum positions off-chain, the actual movement of funds must be atomic and irrevocable to eliminate counterparty risk. Traditional RTGS systems are centralized; we aim to demonstrate a decentralized approach using Stablecoins (USDC).

## Decision
We will implement an **Atomic Batch Settlement Smart Contract** (`Settlement.sol`) on an EVM-compatible blockchain (Ethereum Sepolia Testnet).

### Key Mechanics
1.  **Batch Processing**: The contract accepts arrays of Debtors and Creditors to process an entire netting cycle in one transaction.
2.  **Atomic Swap**: The contract uses a "Harvest and Distribute" pattern:
    *   Pull funds from all Debtors (requires `ERC20.approve`).
    *   Push funds to all Creditors.
    *   Revert if any transfer fails (All-or-Nothing).
3.  **Solvency Check**: The contract verifies `Total In >= Total Out` before finalizing.

## Consequences
### Positive
*   **Atomicity**: Eliminates "Principal Risk" where one party pays but another fails to pay.
*   **Transparency**: Settlement is verifiable on the public ledger.
*   **Efficiency**: Reduces gas costs by bundling multiple transfers into one call.

### Negative
*   **Gas Costs**: The Settlement Agent pays the gas for the batch (though this is cheaper than individual transactions).
*   **Dependency**: Requires Debtors to technically "Approve" the contract beforehand (handled via off-chain mandates in production, or direct calls in demo).
