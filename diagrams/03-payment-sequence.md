sequenceDiagram
    participant Client as Debtor Agent (Sender)
    participant API as SCSE API
    participant Engine as Orchestrator
    participant Ledger as Internal Ledger
    participant Chain as Settlement Adapter

    Client->>API: POST /payments (pacs.008)
    API->>Engine: Submit Instruction
    Engine->>Engine: Validate Schema
    Engine->>Engine: Check IVMS101 (if needed)
    Engine->>Ledger: Check Balance & Reserve
    alt Insufficient Balance
        Ledger-->>Engine: Reject
        Engine-->>API: 400 Bad Request
        API-->>User: REJECTED (Reason: No Liquidity)
    else Sufficient Balance
        Ledger-->>Engine: Reserved
        Engine->>Engine: State = CLEARED
        API-->>User: 202 Accepted (State: CLEARED)
    end
    
    par Async Settlement
        Engine->>Engine: State = PENDING_SETTLEMENT
        Engine->>Chain: Execute Settlement (RTGS)
        Chain-->>Engine: Success (Tx Hash)
        Engine->>Engine: State = SETTLED
        Engine->>Ledger: Commit Balance Deduction
    end
