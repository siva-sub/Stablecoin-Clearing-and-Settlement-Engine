# ADR 003: Adoption of IVMS101 for Travel Rule

**Status**: Accepted
**Date**: 2026-01-12

## Context
Global regulators (FATF) require "Travel Rule" compliance for crypto modifications above certain thresholds (typically $1k USD/EUR). We need a standardized way to transmit Originator and Beneficiary data.

## Decision
We adopt the **IVMS101** (interVASP Messaging Standard) data model embedded within our `PaymentInstruction`.

## Implementation
*   **Threshold**: 1000.00 units (configurable).
*   **Data Structure**: Our JSON schema embeds `Originator` and `Beneficiary` objects strictly following IVMS101 field definitions (NaturalPerson, LegalPerson, etc.).
*   **Validation**: The Clearing Engine strictly rejects payments above the threshold if this data is missing (`RR04`).

## Consequences
*   **Positive**: Ensures interoperability with real-world VASPs and Compliance solutions (TRISA, Sygna, etc.).
*   **Negative**: Increases payload size and schema complexity.
