# Observability Strategy

To operate SCSE in production, we require deep visibility into the flows.

## 1. Structured Logging
We use `structlog` to emit JSON logs for ingestion by ELK/Splunk.
*   **Trace ID**: `instruction_id` is passed through all layers (API -> Clearing -> Ledger -> Settlement).
*   **Levels**:
    *   `INFO`: State transitions (CLEARED -> NETTED).
    *   `ERROR`: Exception traces with stack.
    *   `WARN`: Business logic rejections (Insufficient funds).

## 2. Metrics (Prometheus)
Key KPIs to track:
*   `scse_payment_volume_total`: Counter (USDC).
*   `scse_payments_processed`: Counter.
*   `scse_ledger_latency_ms`: Histogram.
*   `scse_settlement_failure_rate`: Gauge.
*   `scse_netting_efficiency`: Ratio (Cleared Volume / Settled Volume).

## 3. Distributed Tracing
OpenTelemetry (OTel) spans for:
*   API Request Latency.
*   DB Transaction Locks.
*   RPC Call Latency (Crucial for SettlementAdapter).
