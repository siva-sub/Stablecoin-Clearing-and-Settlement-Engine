sequenceDiagram
    participant Engine
    participant S_Mgr as Settlement Manager
    participant Adapter as ERC20 Adapter
    participant Chain as Blockchain Node

    Engine->>S_Mgr: Settle Payment(s) [ID: 123]
    S_Mgr->>Adapter: submit_transfer(to, amount)
    Adapter->>Chain: eth_sendRawTransaction(signed_tx)
    Chain-->>Adapter: tx_hash
    Adapter-->>S_Mgr: PENDING (ref: tx_hash)
    S_Mgr-->>Engine: Status: PENDING_SETTLEMENT
    
    loop Polling / Webhook
        Adapter->>Chain: eth_getTransactionReceipt(tx_hash)
        alt Not Mined
            Chain-->>Adapter: null
        else Mined (Success)
            Chain-->>Adapter: Receipt (Status: 1)
            Adapter->>S_Mgr: SUCCESS
            S_Mgr->>Engine: Status: SETTLED
        else Reverted
            Chain-->>Adapter: Receipt (Status: 0)
            Adapter->>S_Mgr: FAILED
            S_Mgr->>Engine: Status: SETTLEMENT_FAILED
        end
    end
