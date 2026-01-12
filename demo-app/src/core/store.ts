import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Participant, PaymentRecord, NettingCycle } from './types';

interface SCSEState {
    participants: Participant[];
    payments: PaymentRecord[];
    cycles: NettingCycle[];

    // Actions
    seedData: () => void;
    addPayment: (p: PaymentRecord) => void;
    updatePaymentStatus: (id: string, status: PaymentRecord['status'], extra?: Partial<PaymentRecord>) => void;
    updateBalance: (participantId: string, delta: number) => void;
    addCycle: (cycle: NettingCycle) => void;
}

export const useSCSEStore = create<SCSEState>()(
    persist(
        (set) => ({
            participants: [],
            payments: [],
            cycles: [],

            seedData: () => {
                set({
                    participants: [
                        { id: 'BANK_A', name: 'Alpha Bank', balance: 100000 },
                        { id: 'BANK_B', name: 'Beta Bank', balance: 100000 },
                        { id: 'BANK_C', name: 'Gamma VASP', balance: 50000 },
                    ],
                    payments: [],
                    cycles: []
                });
            },

            addPayment: (p) => set((state) => ({ payments: [p, ...state.payments] })),

            updatePaymentStatus: (id, status, extra) => set((state) => ({
                payments: state.payments.map(p =>
                    p.instructionId === id ? { ...p, status, ...extra } : p
                )
            })),

            updateBalance: (pid, delta) => set((state) => ({
                participants: state.participants.map(p =>
                    p.id === pid ? { ...p, balance: p.balance + delta } : p
                )
            })),

            addCycle: (c) => set((state) => ({ cycles: [c, ...state.cycles] }))
        }),
        {
            name: 'scse-storage',
        }
    )
);
