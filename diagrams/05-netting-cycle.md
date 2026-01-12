sequenceDiagram
    participant Scheduler
    participant NetEngine as Netting Engine
    participant DB as Payment DB
    participant Ledger

    Scheduler->>NetEngine: Trigger Cycle (e.g. 15:00)
    NetEngine->>DB: Fetch Status=CLEARED
    DB-->>NetEngine: List[Payment]
    
    loop Bilateral Netting
        NetEngine->>NetEngine: Group by Pair (A<->B)
        NetEngine->>NetEngine: Calculate Net Obligation
    end
    
    loop Multilateral Offset (Optional)
        NetEngine->>NetEngine: Calculate Net Position per Agent
    end
    
    NetEngine->>DB: Update Status=NETTED
    NetEngine->>Ledger: Post Net Settlements
    
    Note right of NetEngine: Only net amounts are sent to settlement
