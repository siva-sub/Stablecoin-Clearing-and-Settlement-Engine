# SCSE Glossary

Definitions of key terms used in the Stablecoin Clearing & Settlement Engine.

## Payment Models

**RTGS (Real-Time Gross Settlement)**
A settlement system where funds are transferred individually for each transaction in real-time. This requires higher liquidity as every payment must be fully funded at the moment of execution.
*Example: Fedwire, TARGET2, CHAPS.*

**DNS (Deferred Net Settlement)**
A settlement system where transactions are accumulated over a period (cycle), and only the net difference between participants is settled at the end of the cycle. This saves liquidity but introduces settlement risk if a participant fails before the net settlement occurs.
*Example: BACS, ACH, CHIPS.*

**Hybrid System**
A system combining elements of RTGS and DNS, often allowing urgent payments to settle immediately (RTGS) while non-urgent ones are netted (DNS).

## Lifecycle & Status

**Clearing**
The process of validating, authorising, and matching payment instructions prior to settlement. In SCSE, this involves schema validation, compliance checks, and liquidity checks.

**Settlement**
The actual discharge of the obligation. In SCSE, this is the on-chain transfer of Stablecoins or the updating of the simulated final ledger.

**Finality**
The moment when a transfer of funds becomes irrevocable and unconditional.
*   **Settlement Finality**: When the asset transfer is legally/technically complete.
*   **On-Chain Finality**: When a transaction is included in a block and has enough confirmations to be considered irreversible.

**Reconciliation**
The process of comparing two sets of records (internal ledger vs on-chain receipts) to ensure they agree.

## Digital Assets & Compliance

**Stablecoin**
A cryptocurrency designed to have a relatively stable price, typically pegged to a commodity or currency like USD or EUR. Used here as the settlement asset.

**IVMS101**
The "InterVASP Messaging Standard". A common data model for exchanging originator and beneficiary information to comply with the Travel Rule.

**Travel Rule**
A FATF recommendation requiring VASPs (Virtual Asset Service Providers) to exchange customer data for transactions above a certain threshold (often 1000 USD/EUR).

**EIP-712**
Ethereum Improvement Proposal 712. A standard for hashing and signing typed structured data. Used in SCSE for non-repudiation of payment instructions.

## ISO 20022 Terms

**pacs.008**
"Financial Institution to Financial Institution Customer Credit Transfer". The standard message for sending funds. Distinguishes between **Agents** (Financial Institutions processing the payment) and **Parties** (Customers initiating/receiving the payment).

**Debtor Agent**
The Financial Institution (Bank/VASP) that services the account of the Debtor (Sender). In SCSE, this is the Participant.

**Creditor Agent**
The Financial Institution (Bank/VASP) that services the account of the Creditor (Receiver).

**Originator (Debtor)**
The customer who initiates the payment. Identified by name, address, and account number.

**Beneficiary (Creditor)**
The customer who is the final recipient of the funds.


**camt.053**
"Bank to Customer Statement". A detailed end-of-day statement reporting entries and balances.
