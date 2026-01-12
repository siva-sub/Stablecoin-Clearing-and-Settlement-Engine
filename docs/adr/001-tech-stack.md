# ADR 001: Technology Stack Selection

**Status**: Accepted
**Date**: 2026-01-12

## Context
We need to select a backend technology stack for the SCSE that supports:
1.  High-precision arithmetic (Currency/Decimal).
2.  Complex data modelling (ISO 20022 schemas).
3.  Rapid MVP development.
4.  Future extensibility for data science/analytics.

## Decision
We chose **Python** with **FastAPI** as the core backend framework.

## Alternatives Considered
*   **Node.js (NestJS)**: Good for I/O, but handling arbitrary precision decimals requires careful library usage (Big.js). Strong typing requires verbose TypeScript definitions.
*   **Go (Golang)**: Excellent performance and concurrency. However, type strictness and lack of generics (historically) slows down initial detailed schema modeling compared to Pydantic. simple data manipulation is more verbose.

## Consequences
*   **Positive**: Pydantic Integration allows us to model complex ISO 20022 and IVMS101 structures with minimal boilerplate. Python's `decimal` module is robust for financial calculations.
*   **Negative**: Python's raw execution speed is slower than Go, but for a settlement engine, database I/O and on-chain latencies are the bottlenecks, not CPU.
