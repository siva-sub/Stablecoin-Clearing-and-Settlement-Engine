sequenceDiagram
    participant Process as Payment Process
    participant Retry as Retry Policy
    participant DLQ as Dead Letter Queue
    
    process->>Process: Attempt Settlement
    alt Success
        process->>Process: Mark SETTLED
    else Temperror (Gas/Network)
        process->>Retry: Check Retry Count
        alt Count < Max
            Retry->>Retry: Backoff (Full Jitter)
            Retry->>Process: Retry Attempt
        else Count >= Max
            Retry->>DLQ: Move to Manual Review
            DLQ->>DLQ: Admin Alert
        end
    else Permerror (Reverted/Logic)
        process->>DLQ: Immediate Fail
    end
