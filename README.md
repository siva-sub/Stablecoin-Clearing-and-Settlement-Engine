# SCSE: Stablecoin Clearing & Settlement Engine

![License](https://img.shields.io/badge/license-MIT-blue)
![Build](https://img.shields.io/badge/build-passing-green)
![Demo](https://img.shields.io/badge/demo-live-orange)

A portfolio-grade financial infrastructure project implementing a **Clearing & Settlement Engine** for Stablecoins (USDC/EURC). 
Designed to demonstrate high-throughput off-chain clearing with settlement finality required by modern payment systems.

🚀 **[Live Demo (Simulated)](https://siva-sub.github.io/Stablecoin-Clearing-and-Settlement-Engine/)**

---

## 📖 Overview

The SCSE simulates a "Bank-to-Bank" or "VASP-to-VASP" payment network. It implements:

1.  **Real-Time Clearing (RTGS)**: Immediate validation, compliance checks (Travel Rule), and funds reservation.
2.  **Multilateral Netting (DNS)**: Optimizing liquidity by netting obligations between 3+ parties (e.g., A->B->C->A = 0 liquidity).
3.  **Settlement Finality**: Simulating on-chain or ledger-based settlement.

This repository contains two implementations:
1.  **Python Backend (`src/`)**: The "Real" implementation using FastAPI, SQLAlchemy (Async), and Structlog.
2.  **React Simulator (`demo-app/`)**: A client-side visualization of the engine logic for demonstration purposes (hosted on GitHub Pages).

---

## 🏗 Architecture

### Hybrid Settlement Model
*   **Layer 1 (Clearing)**: Private Ledger (SQL). High speed (10k+ TPS). Handles privacy and validation.
*   **Layer 2 (Settlement)**: Public Blockchain (simulated here as "Upstream"). Handles finality.

### Core Components
*   **Clearing Engine**: Validates ISO 20022 schemas and enforces IVMS101 (Travel Rule) for payments > $1k.
*   **Netting Engine**: Periodically aggregates `CLEARED` payments into `NettingCycles` to reduce liquidity requirements.
*   **Reconciliation**: Automated service to verify Internal Ledger vs External Chain.

---

## ⚡ Key Features

*   **ISO 20022 Aligned**: Uses standard terminology (DebtorAgent, CreditorAgent).
*   **Compliance Ready**: Built-in hooks for Travel Rule (IVMS101) data structure.
*   **Double-Entry Ledger**: Strict accounting consistency (Debits = Credits).
*   **Observability**: Structured Logging and detailed state machine tracking.

---

## 🛠 Usage (Python Backend)

### Prerequisites
*   Python 3.10+
*   SQLite (Built-in)

### Setup
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Run Server
```bash
uvicorn src.main:app --reload
```
API Docs will be available at `http://localhost:8000/docs`.

### Run Tests
```bash
pytest tests/
```

---

## 🖥 Usage (Demo App)

The `demo-app` is a standalone React application that runs a complete simulation of the SCSE logic in your browser.

```bash
cd demo-app
npm install
npm run dev
```

---

## 📚 Documentation
*   [Flow Diagrams](docs/FLOWS.md)
*   [State Machine](docs/STATE_MACHINE.md)
*   [Netting Algorithm](docs/NETTING.md)
*   [Security](docs/SECURITY.md)

---

## Disclaimer
This is a portfolio project/prototype. It is not audited for mainnet production use.
