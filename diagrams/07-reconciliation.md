flowchart TD
    subgraph Inputs
        Ledger[Internal Ledger DB]
        Chain[On-Chain Transfer Events]
    end
    
    subgraph Recon Engine
        Fetch[Fetch Daily Activity]
        Match[Match Entries]
        Diff[Identify Discrepancies]
    end
    
    subgraph Outputs
        Report[Recon Report]
        Alerts[Mismatch Alerts]
    end
    
    Ledger --> Fetch
    Chain --> Fetch
    Fetch --> Match
    Match -- "Amount/Participant Match" --> Diff
    
    Diff -- "Perfect Match" --> Report
    Diff -- "Missing on Chain" --> Alerts
    Diff -- "Missing in Ledger" --> Alerts
    Diff -- "Amount Mismatch" --> Alerts
