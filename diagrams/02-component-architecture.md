graph TD
    subgraph "API Layer"
        REST[FastAPI Routes]
    end

    subgraph "Core Domain"
        Orch[Orchestrator]
        Clear[Clearing Service]
        Valid[Validator]
        Compliance[Compliance Check]
        Ledger[Ledger Service]
    end

    subgraph "Netting Domain"
        NetEngine[Netting Engine]
        Cycle[Cycle Scheduler]
    end

    subgraph "Settlement Domain"
        SetMgr[Settlement Manager]
        OnChain[ERC-20 Adapter]
        Sim[Simulated Adapter]
    end

    REST --> Orch
    Orch --> Clear
    Clear --> Valid
    Clear --> Compliance
    Orch --> Ledger
    Orch --> NetEngine
    NetEngine --> Cycle
    Orch --> SetMgr
    SetMgr --> OnChain
    SetMgr --> Sim
