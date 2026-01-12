# ADR 005: Settlement Retry Strategy

**Status**: Accepted
**Date**: 2026-01-12

## Context
On-chain transactions can fail due to temporary network issues, gas price spikes, or RPC timeouts. We need a strategy to handle these 'transient' failures vs 'permanent' failures.

## Decision
We implement a **3-attempt retry mechanism with exponential backoff**.

## Logic
1.  Attempt 1.
2.  If fail (transient error): Wait 2s -> Attempt 2.
3.  If fail: Wait 4s -> Attempt 3.
4.  If fail: Mark as `FAILED`.

## Consequences
*   **Positive**: Increases robustness against network jitter.
*   **Negative**: Increases latency for genuinely failed transactions.
