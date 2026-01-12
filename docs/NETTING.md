# Netting Engine & Liquidity Optimization

SCSE implements a **Multilateral Netting Engine** to optimize liquidity usage among participants.

## Overview

In a gross settlement system (RTGS), every payment requires immediate liquidity. In a Deferred Net Settlement (DNS) system, payments are accumulated and offset against each other. SCSE uses a central pool model for multilateral netting.

## Core Concepts

*   **Gross Obligation**: The total amount an agent wants to send.
*   **Net Position**: The calculated difference between incoming and outgoing funds.
*   **SCSE_POOL**: A virtual Central Counterparty (CCP) that sits in the middle of all net settlements.

## Algorithm

1.  **Selection**: Identify all `CLEARED` payments since the last cycle.
2.  **Aggregation**:
    *   Sum all outgoing payments for Agent A -> `Debits`
    *   Sum all incoming payments for Agent A -> `Credits`
3.  **Calculation**:
    *   `NetStatus = Credits - Debits`
4.  **Instruction Service**:
    *   **If NetStatus < 0**: Agent OWES the Pool. (Instruction: `Agent -> Pool`).
    *   **If NetStatus > 0**: Pool OWES the Agent. (Instruction: `Pool -> Agent`).
    *   **If NetStatus = 0**: No movement required.

## Example

**Transactions**:
1. A -> B: $100
2. B -> C: $40
3. C -> A: $20
4. A -> C: $10

**Analysis for Agent A**:
*   Sent: $100 (to B) + $10 (to C) = $110
*   Received: $20 (from C)
*   **Net**: $20 - $110 = **-$90** (PAYS 90)

**Analysis for Agent B**:
*   Sent: $40 (to C)
*   Received: $100 (from A)
*   **Net**: $100 - $40 = **+$60** (RECEIVES 60)

**Analysis for Agent C**:
*   Sent: $20 (to A)
*   Received: $40 (from B) + $10 (from A) = $50
*   **Net**: $50 - $20 = **+$30** (RECEIVES 30)

**Result**: Total liquidity moved is $90 (A's payment), satisfying $170 of volume.
