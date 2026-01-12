stateDiagram-v2
    [*] --> RECEIVED
    RECEIVED --> VALIDATED: Schema Valid
    RECEIVED --> REJECTED: Schema Invalid
    
    VALIDATED --> CLEARED: Balance Check OK
    VALIDATED --> REJECTED: Insufficient Funds
    VALIDATED --> QUEUED: Gridlock / No Liquidity (DNS)
    
    state "Settlement Logic" as Settlement {
        CLEARED --> NETTED: Included in Batch (DNS)
        CLEARED --> PENDING_SETTLEMENT: RTGS Trigger
        NETTED --> PENDING_SETTLEMENT: Batch Closure
        
        PENDING_SETTLEMENT --> SETTLED: Tx Confirmed
        PENDING_SETTLEMENT --> SETTLEMENT_FAILED: Tx Revert/Error
        
        SETTLEMENT_FAILED --> PENDING_SETTLEMENT: Retry (Count < 3)
        SETTLEMENT_FAILED --> FAILED: Max Retries
    }
    
    SETTLED --> [*]
    FAILED --> REVERSED: Manual Intervention
    REVERSED --> [*]
