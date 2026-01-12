# System Flows

This document details the end-to-end flows of the Stablecoin Clearing & Settlement Engine (SCSE).

## 1. Payment Submission & Clearing (Happy Path)

**Actor**: Debtor Agent (Bank/VASP)
**Endpoint**: `POST /payments`

1.  **Ingestion**: API receives `payment_instruction` (JSON).
2.  **Validation**:
    *   **Schema**: Checked against `PaymentInstruction` model.
    *   **Participants**: Validates `debtorAgent` and `creditorAgent` exist.
    *   **Compliance (Travel Rule)**:
        *   If `amount` >= 1000 USDC, checks for presence of `ivms101` payload.
        *   If missing, rejects with code `RR04` (Regulatory Reason).
3.  **Ledger Reservation**:
    *   Checks Debtor's available balance in Internal Ledger.
    *   If sufficient: Debits Debtor (reservation), Status -> `CLEARED`.
    *   If insufficient: Status -> `REJECTED` (Reason `AM04`).

## 2. Netting Cycle (DNS)

**Actor**: Scheduler / Operator
**Endpoint**: `POST /netting/run`

1.  **Trigger**: Cycle starts (Status: `CALCULATING`).
2.  **Selection**: Engine selects all payments with status `CLEARED`.
3.  **Calculation**:
    *   Aggregates "Payables" and "Receivables" per Agent per Currency.
    *   Computes **Net Position** = Total Receivables - Total Payables.
4.  **Instruction Generation**:
    *   **Net Debtors** (Negative Position): Instructed to pay the `SCSE_POOL`.
    *   **Net Creditors** (Positive Position): Instructed to receive from `SCSE_POOL`.
5.  **Finalization**: Payments marked as `NETTED`. Cycle Status -> `CLOSED`.

## 3. Settlement (Phase 3)

**Actor**: Settlement Adapter

1.  **Execution**: Adapter reads `SettlementInstruction`s.
2.  **On-Chain / Simulation**:
    *   Debtor -> Pool Transfer.
    *   Pool -> Creditor Transfer.
3.  **Confirmation**:
    *   Upon success traverse chain: `NETTED` -> `PENDING_SETTLEMENT` -> `SETTLED`.
