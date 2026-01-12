contextDiagram
    processing
    participant "Debtor Agent (FI)" as DebtorAgent
    participant "Creditor Agent (FI)" as CreditorAgent
    participant "SCSE Core" as System
    participant "Ethereum / Hardhat" as Chain
    participant "Sanctions Oracle" as Compliance

    DebtorAgent->>System: Submit Payment (pacs.008)
    System->>DebtorAgent: Status Update (pacs.002)
    System->>CreditorAgent: Advice / Credit Notif (camt.054)
    System->>Compliance: Screen Participant
    Compliance-->>System: Result
    System->>Chain: ERC-20 Transfer
    Chain-->>System: Tx Receipt
