# Reconciliation Architecture

Reconciliation is the final line of defense for financial integrity. SCSE performs **T+0 Intraday Reconciliation**.

## Sources of Truth

1.  **Internal Ledger (SQL)**: Records of Intent (CLEARED) and internal state.
2.  **Blockchain (EVM)**: Records of Finality (SETTLED).
3.  **Bank Statements (Fiat)**: For On-Ramp/Off-Ramp (Out of Scope for MVP).

## The Reconciliation Loop

The `ReconciliationService` runs periodically (e.g. every hour) or on demand.

### Logic
1.  **Fetch SETTLED items from SQL**: Get all payments marked as settled since last high-water mark.
2.  **Verify on Chain**: For each item, query the RPC provider for the `settlement_reference` (Tx Hash).
    *   Verify `to`, `from`, `amount` match exactly.
    *   Verify `status` is `Success (1)`.
3.  **Flag Mismatches**:
    *   **Orphaned**: SQL says Settled, Chain says Failed/Missing -> Alarm! (Action: Reverse or Re-broadcast).
    *   **Unrecorded**: Chain says Success, SQL says Pending -> Auto-fix SQL to Settled.

## Automated Actions

*   **Green**: 100% Match.
*   **Amber**: Timing mismatches (Chain pending).
*   **Red**: Data value mismatches or confirmed failures. Requires Admin intervention.
