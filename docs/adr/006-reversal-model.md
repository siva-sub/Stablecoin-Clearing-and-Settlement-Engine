# ADR 006: Reversal Model

**Status**: Accepted
**Date**: 2026-01-12

## Context
When a CLEARED payment fails to settle on-chain after all retries, the funds are stuck in a "Reserved" state. We need to unlock them.

## Decision
We use **Compensating Transactions** (Reversals). We NEVER delete Ledger entries.

## Implementation
*   If Payment P1 (Debtor -> Creditor) fails:
*   Create new Ledger Entry: Credit Debtor (Amount) with reference `REVERSAL-P1`.
*   Mark Payment status `REVERSED`.

## Consequences
*   **Positive**: Maintains full audit trail. Prevents race conditions associated with row deletion.
*   **Negative**: Increases data volume.
