# ADR 007: Participant Model

**Status**: Accepted
**Date**: 2026-01-12

## Context
How do we identify participants and manage their credit risk?

## Decision
1.  **Identity**: Participants are identified by **BIC-like** strings (e.g., `BANKUS33`, `VASPGB22`).
2.  **Credit Model**: **Prefunded**. Participants must deposit assets into the SCSE ecosystem (or Smart Contract) *before* sending payments.

## Consequences
*   **Positive**: Eliminates settlement risk (user can't send what they don't have). Simplifies Clearing engine checks.
*   **Negative**: High liquidity cost for participants (funds sit idle).
