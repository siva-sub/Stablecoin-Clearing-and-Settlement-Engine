# ADR 011: ISO 20022 Interoperability Strategy

## Status
Accepted

## Context
While SCSE uses modern JSON schemas and Blockchain settlement, it must coexist with legacy banking infrastructure. Banks and Regulators require messages in the **ISO 20022** XML standard (specifically `CBPR+` and `SEPA` guidelines) for compliance and reconciliation.

## Decision
We will implement a **Client-Side ISO 20022 Generator** that converts SCSE `PaymentInstruction` objects into valid `pacs.008.001.08` (Financial Institution to Financial Institution Customer Credit Transfer) XML messages.

### implementation Details
*   **Format**: `pacs.008` (Customer Credit Transfer) is chosen as it is the standard for clearing retail payments.
*   **Mapping**: Internal Agent IDs (e.g., "Bank A") are deterministically mapped to Mock BICs (e.g., "BANKUS33XXX").
*   **Location**: The generation logic resides in the Frontend (`iso20022.ts`). This allows users to "Export" data without server round-trips.

## Consequences
### Positive
*   **Interoperability**: Demonstrates that SCSE can feed into existing SWIFT/SEPA rails.
*   **Compliance**: Meets regulatory requirements for standard messaging.
*   **Zero-Overhead**: Client-side generation places no load on the high-throughput matching engine.

### Negative
*   **Validation**: We are generating XML via templates, not a strict XSD-enforcing library. Validation is "Best Effort" for the demo.
