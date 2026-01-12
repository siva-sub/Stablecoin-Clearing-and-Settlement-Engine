# ADR 002: Hybrid Settlement Model

**Status**: Accepted
**Date**: 2026-01-12

## Context
Payment systems can settle transactions in real-time (RTGS) or in deferred batches (DNS). We need a model that supports high throughput while minimizing on-chain gas costs and liquidity fragmentation.

## Decision
We define a **Hybrid Model**:
1.  **Internal Private Ledger**: Acts as the primary record for "Clearing". Funds are reserved here immediately using off-chain balances (pre-funded).
2.  **Settlement Adapters**: The finality is decoupled from clearing. 
    *   **RTGS Mode**: 1-to-1 trigger to chain immediately after clearing.
    *   **DNS Mode**: Payments are chemically netted in the private ledger, and only net positions are settled on-chain.

## Consequences
*   **Positive**: Allows the system to process thousands of TPS internally while only touching the blockchain (slow/expensive) for net settlements. Supports "Privacy by Design" (individual payments not visible on-chain in DNS mode).
*   **Negative**: Introduces a "Central Operator" trust assumption for the internal ledger, unless replaced by a Validium/L2 proof in the future.
