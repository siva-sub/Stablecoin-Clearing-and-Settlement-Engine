import { useSCSEStore } from './store';
import type { PaymentInstruction, PaymentRecord, NettingCycle, SettlementInstruction } from './types';

// Simple ID gen to avoid dependency for now
const genId = () => Math.random().toString(36).substr(2, 9);

export class ClearingEngine {
    static async submitPayment(instruction: PaymentInstruction): Promise<PaymentRecord> {
        const store = useSCSEStore.getState();
        const { debtorAgent, creditorAgent, amount } = instruction;

        // 1. Init Record
        const record: PaymentRecord = {
            ...instruction,
            status: 'RECEIVED',
            timestamp: new Date().toISOString()
        };
        store.addPayment(record);

        // Simulate Processing Delay
        await new Promise(r => setTimeout(r, 800));

        // 2. Validate Participants
        const debtor = store.participants.find(p => p.id === debtorAgent);
        if (!debtor || !store.participants.find(p => p.id === creditorAgent)) {
            store.updatePaymentStatus(instruction.instructionId, 'REJECTED', { reasonCode: 'AG01' });
            return { ...record, status: 'REJECTED' };
        }

        // 3. Compliance Check (IVMS101 stub)
        if (amount >= 1000) {
            // In simulation, we assume if they sent it via UI, it's fine. 
            // Or we could randomize failure for demo.
        }

        // 4. Funds Check & Reservation
        if (debtor.balance < amount) {
            store.updatePaymentStatus(instruction.instructionId, 'REJECTED', { reasonCode: 'AM04' });
            return { ...record, status: 'REJECTED' };
        }

        // Debit Debtor (Reservation)
        store.updateBalance(debtorAgent, -amount);

        // Mark Cleared
        store.updatePaymentStatus(instruction.instructionId, 'CLEARED');

        return { ...record, status: 'CLEARED' };
    }
}

export class NettingEngine {
    static async runCycle(): Promise<NettingCycle> {
        const store = useSCSEStore.getState();
        const cycleId = genId();

        // 1. Select Cleared Payments
        const candidates = store.payments.filter(p => p.status === 'CLEARED');

        // 2. Calculate Nets
        const netMap = new Map<string, number>(); // Agent -> Net Amount

        candidates.forEach(p => {
            // Debtor pays (negative)
            netMap.set(p.debtorAgent, (netMap.get(p.debtorAgent) || 0) - p.amount);
            // Creditor receives (positive)
            netMap.set(p.creditorAgent, (netMap.get(p.creditorAgent) || 0) + p.amount);

            // Update status to NETTED
            store.updatePaymentStatus(p.instructionId, 'NETTED', { cycleId });
        });

        // 3. Generate Instructions
        const instructions: SettlementInstruction[] = [];
        netMap.forEach((netAmount, agentId) => {
            if (Math.abs(netAmount) < 0.01) return;

            if (netAmount < 0) {
                // Agent pays Pool
                instructions.push({
                    id: genId(), cycleId, debtorAgent: agentId, creditorAgent: 'SCSE_POOL', amount: Math.abs(netAmount), status: 'PENDING'
                });
            } else {
                // Pool pays Agent
                instructions.push({
                    id: genId(), cycleId, debtorAgent: 'SCSE_POOL', creditorAgent: agentId, amount: netAmount, status: 'PENDING'
                });
            }
        });

        const cycle: NettingCycle = {
            id: cycleId,
            status: 'CLOSED',
            startTime: new Date().toISOString(),
            settlementInstructions: instructions
        };

        store.addCycle(cycle);
        return cycle;
    }
}

export class SettlementManager {
    static async processRTGS(): Promise<void> {
        const store = useSCSEStore.getState();
        const candidates = store.payments.filter(p => p.status === 'CLEARED');

        for (const p of candidates) {
            store.updatePaymentStatus(p.instructionId, 'PENDING_SETTLEMENT');

            // Simulate Chain Latency
            await new Promise(r => setTimeout(r, 500));

            // Settle: Credit Creditor (Debtor was already debited in Clearing)
            store.updateBalance(p.creditorAgent, p.amount);
            store.updatePaymentStatus(p.instructionId, 'SETTLED', {
                settlementRef: `0x${genId()}${genId()}`
            });
        }
    }

    static async processCycle(cycleId: string): Promise<void> {
        const store = useSCSEStore.getState();
        const cycle = store.cycles.find(c => c.id === cycleId);
        if (!cycle) return;

        // Simulate processing
        await new Promise(r => setTimeout(r, 1500));

        // Apply net movements
        cycle.settlementInstructions.forEach(instr => {
            if (instr.debtorAgent === 'SCSE_POOL') {
                // Pool pays Agent -> Credit Agent
                store.updateBalance(instr.creditorAgent, instr.amount);
            } else {
                // Agent pays Pool -> Debit Agent ?? 
                // WAIT. In clearing we already reserved funds (debited).
                // Netting with pre-funded clearing is tricky.
                // IF we debited Gross in clearing, then Netting is a refund of difference?
                // OR, did we hold reservation?

                // SIMPLIFICATION For Demo:
                // If we validated and debited 100% in Clearing, then the "Netting" is actually just verifying we can settle.
                // BUT standard DNS implies we *didn't* debit fully, or we settle the net.

                // HYBRID MODEL (as per Architectural Decision):
                // We reserved Gross. 
                // Net Settlement means: 
                // 1. We actually only move Net on chain.
                // 2. We adjust internal balances to reflect the "savings". 

                // Ex: A->B 100. A Reserved 100. B gets nothing yet.
                // B->A 90. B Reserved 90. A gets nothing yet.
                // Net: A pays 10. B receives 10.

                // Settlement:
                // Chain: A -> Pool 10. Pool -> B 10.
                // Internal Ledger Adjustment: 
                // A: Was -100. Should be -10. Refund 90.
                // B: Was -90. Should be +10. Refund 90 + Credit 10? 

                // Implementation for Demo Simplicity:
                // We will just "Credit the Receiver" the full amount of the original Payment? 
                // NO, that's RTGS.

                // Correct Simulation for Demo:
                // 1. Clearing: Debited Sender. Credited "Reservation Account" (Implicit).
                // 2. Settlement: 
                //    We credit the Beneficiary.
                //    Wait, checking original payments.
                //    This `NettingEngine` logic above calculated impacts based on GROSS amounts.
                //    So `instructions` represent what needs to happen *relative to the start*.

                // Let's stick to simple ledger logic for the demo:
                // RTGS: Debit Sender (Done), Credit Receiver (Done in processRTGS).
                // Netting: Debit Sender (Done). 
                // We need to Credit Receiver for the payments they received.
                // AND we need to Refund Sender for the liquidity saved?

                // REVISED NETTING LOGIC FOR DEMO:
                // Just Credit the Creditors for all NETTED payments?
                // Yes. If A->B 100 is "Settled" via Netting, B needs +100.
                // The "Liquidity Saving" is that A didn't need to *deposit* 100 on chain, they just needed 10.
                // But internally, they spent 100.

                // Okay, so `processCycle` just needs to:
                // 1. Mark payments SETTLED.
                // 2. Credit the `creditorAgent` for each original payment.
                // This closes the loop. Simulation of "On-Chain Net Settlement" is just visual.
            }
        });

        // Actually, do the simple thing:
        // Iterate all payments in the cycle and "Settle" them (Credit beneficiary).
        const payments = store.payments.filter(p => p.cycleId === cycleId);
        payments.forEach(p => {
            store.updateBalance(p.creditorAgent, p.amount);
            store.updatePaymentStatus(p.instructionId, 'SETTLED', { settlementRef: `0xNet${genId()}` });
        });
    }
}
