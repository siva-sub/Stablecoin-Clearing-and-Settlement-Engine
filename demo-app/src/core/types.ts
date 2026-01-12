export interface Participant {
    id: string;
    name: string;
    balance: number; // USDC
}

export type PaymentStatus =
    | 'RECEIVED'
    | 'VALIDATED'
    | 'CLEARED'
    | 'REJECTED'
    | 'NETTED'
    | 'PENDING_SETTLEMENT'
    | 'SETTLED'
    | 'FAILED';

export interface PaymentInstruction {
    instructionId: string;
    debtorAgent: string;
    creditorAgent: string;
    amount: number;
    currency: 'USDC';
}

export interface PaymentRecord extends PaymentInstruction {
    status: PaymentStatus;
    timestamp: string;
    reasonCode?: string;
    settlementRef?: string;
    cycleId?: string;
}

export interface NettingCycle {
    id: string;
    status: 'OPEN' | 'CALCULATING' | 'CLOSED';
    startTime: string;
    endTime?: string;
    settlementInstructions: SettlementInstruction[];
}

export interface SettlementInstruction {
    id: string;
    cycleId: string;
    debtorAgent: string;
    creditorAgent: string;
    amount: number;
    status: 'PENDING' | 'SETTLED' | 'FAILED';
}
