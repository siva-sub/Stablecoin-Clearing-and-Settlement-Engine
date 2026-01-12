# Security Design

## 1. Authentication & Authorization
*   **mTLS**: All Participant interactions (API) should be secured via Mutual TLS (Banks/VASPs verify identity via Certificates).
*   **API Keys**: Secondary mechanism for non-critical reads.
*   **RBAC**:
    *   `ROLE_ADMIN`: Can trigger Reversals and managing Participants.
    *   `ROLE_AGENT`: Can submit payments and query own balance.

## 2. Key Management (Critical)
The System wallet (`SCSE_POOL`) controls liquidity.
*   **Production**: Keys MUST reside in an HSM (Hardware Security Module) or MPC (Multi-Party Computation) cluster (e.g. Fireblocks, AWS KMS).
*   **Never** store private keys in environment variables or code.

## 3. Smart Contract Risk
*   If managing a custom Pool Contract, it must be audited.
*   Adhere to Checks-Effects-Interactions pattern to prevent Reentrancy.

## 4. Operational Security
*   **Segregation of Duty**: No single developer can deploy to production.
*   **Audit Logs**: All manual Admin actions (deposits, reversals) are immutable.
