# ADR 008: Ledger vs Chain Truth

**Status**: Accepted
**Date**: 2026-01-12

## Context
We have an Internal Ledger (SQL) and an External Ledger (Blockchain/ERC-20). Which one is the "Truth"?

## Decision
The **Blockchain** is the ultimate Source of Truth for settled funds.

## Hierarchy
1.  **Cleared/Reserved**: SQL is the truth (Temporal consistency).
2.  **Settled**: Chain is the truth.
3.  **Reconciliation**: If SQL says "Settled" but Chain says "Failed", the Chain wins. SQL must be corrected (Reversed).

## Consequences
*   **Positive**: Trustless finality.
*   **Negative**: Complicates reconciliation logic (we must constantly listen to the chain).
