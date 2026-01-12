# SCSE: Stablecoin Clearing & Settlement Engine

[![Static Demo](https://img.shields.io/badge/Demo-GitHub--Pages-blue)](https://yourusername.github.io/SCSE/)

**SCSE** is a portfolio-grade financial infrastructure proof-of-concept. It represents a hybrid **Clearing & Settlement Engine** capable of bridging traditional payment messaging (ISO 20022/IVMS101) with blockchain-based settlement (ERC-20).


## 🚀 Use Case
Banks and VASPs (Virtual Asset Service Providers) need to settle stablecoin payments efficiently. 
*   **Problem**: Settle every transaction on-chain (RTGS) is expensive ($1-$5 gas) and slow (12s finality).
*   **Solution**: SCSE provides an internal **Clearing Layer** that validates compliance (Travel Rule), reserves funds off-chain, and offers **Multilateral Netting** to reduce liquidity requirements by up to 50% before settling on-chain.

## 🌟 Key Features

*   **Hybrid Settlement Model**: Supports both **RTGS** (Immediate) and **DNS** (Deferred Net Settlement).
*   **Compliance Native**: Embedded **IVMS101** data model for Travel Rule compliance.
*   **ISO 20022 Aligned**: Terminology and schemas follows `pacs.008`, `pacs.002`, and `camt.053` standards.
*   **Liquidity Efficiency**: Integrated **Netting Engine** calculates multilateral positions to minimize on-chain capital needs.
*   **Observability**: Full dashboard for monitoring balances and settlement lifecycles.

## 🛠️ Technology Stack

*   **Backend**: Python, FastAPI, SQLAlchemy (Async), Pydantic.
*   **Database**: SQLite (MVP), PostgreSQL (Production ready).
*   **Frontend**: React, Mintine UI, Vite.
*   **Simulation**: Built-in "Simulated Chain" adapter for realistic latency verification.

## 🏗️ Architecture

```mermaid
graph TD
    A[Bank A] -->|API (pacs.008)| B(Clearing Engine)
    A -->|Deposit| C(Internal Ledger)
    
    B -->|Validate & Reserve| C
    B -->|Travel Rule Check| D{Compliance}
    
    D -->|Fail| E[Reject (pacs.002)]
    D -->|Pass| F[Cleared State]
    
    F -->|Path 1: RTGS| G[Settlement Adapter]
    F -->|Path 2: Netting| H[Netting Engine]
    
    H -->|Net Instructions| G
    G -->|Tx Hash| I[(Blockchain / L2)]
```

## ⚡ Quick Start

### 1. 🌐 Static Live Demo (No Install)
The dashboard includes a **Stateful Demo Mode**. If the backend is unreachable, it automatically switches to a high-fidelity simulation using `localStorage`.

*   **Host on GitHub Pages**:
    ```bash
    cd frontend
    npm run build
    # The build outputs to src/dashboard
    # You can deploy the contents of src/dashboard to any static host.
    ```

### 2. Backend Setup
```bash
# Clone and Install
git clone https://github.com/yourusername/scse.git
cd scse
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run API (Port 8000)
uvicorn src.main:app --reload
```

### 2. Dashboard Setup
```bash
cd frontend
npm install
npm run dev
```

## 📖 API Documentation

The API supports the full lifecycle of a payment.
*   **Docs**: `http://localhost:8000/docs`

### Key Endpoints
*   `POST /participants`: Onboard a new Bank/VASP.
*   `POST /payments`: Submit a payment instruction.
*   `POST /netting/run`: Trigger the Multilateral Netting cycle.
*   `POST /settlement/process-cycle/{id}`: Settle the netted obligations.

## 🧪 Testing

Run the integration suite to verify the Netting Logic and Settlement flows.
```bash
pytest tests/
```

## 📄 License
MIT
