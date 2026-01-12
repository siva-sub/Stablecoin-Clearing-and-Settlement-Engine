# ADR 004: Settlement Finality

**Status**: Accepted
**Date**: 2026-01-12

## Context
When settling transactions on a blockchain (like Ethereum/EVM), finality is probabilistic. We need to decide when the SCSE considers a settlement "SETTLED".

## Decision
We accept **"Finality on First Confirmation"** (1 block) as the default for the MVP, but the system must support a **configurable confirmation depth**.

## Consequences
*   **Positive**: Provides a faster user experience for the demo/MVP.
*   **Negative**: Risk of reorgs (uncles/ommers) in a real PoW/PoS environment rolling back the settlement. Production systems would require 12+ blocks (Ethereum) or "finalized" checkpoint (L2s).
*   **Mitigation**: The Reconciliation loop (Phase 3) will handle reorgs by flagging mismatches.
