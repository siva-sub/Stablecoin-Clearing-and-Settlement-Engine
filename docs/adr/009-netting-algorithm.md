# ADR 009: Netting Algorithm

**Status**: Accepted
**Date**: 2026-01-12

## Context
How do we define the netting logic for DNS mode?

## Decision
We implement **Multilateral Netting** via a Central Counterparty (CCP) logic.

## Logic
*   We do NOT do Bilateral Nettings (A <-> B) first.
*   We calculate the global Net Position of Agent A against the System.
*   Result is a single instruction per Agent per Cycle (pay or receive).

## Consequences
*   **Positive**: Maximum liquidity efficiency (e.g., A->B->C->A = 0 liquidity needed).
*   **Negative**: If one participant fails to settle their net obligation, the entire batch may fail (Gridlock), requiring an "Unwind" procedure (out of scope for MVP).
