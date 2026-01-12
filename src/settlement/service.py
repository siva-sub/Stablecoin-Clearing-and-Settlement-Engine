import asyncio
import random
from datetime import datetime
from abc import ABC, abstractmethod
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database_models import Payment, PaymentStatus, SettlementInstruction

class SettlementAdapter(ABC):
    @abstractmethod
    async def settle(self, reference: str, debtor: str, creditor: str, amount: str, currency: str) -> str:
        """
        Execute settlement. Returns a transaction hash/reference.
        Raises exception on failure.
        """
        pass

class SimulatedAdapter(SettlementAdapter):
    async def settle(self, reference: str, debtor: str, creditor: str, amount: str, currency: str) -> str:
        # Simulate Network Latency
        await asyncio.sleep(1) 
        
        # Simulate slight chance of failure
        if random.random() < 0.05: # 5% failure rate
            raise Exception("Simulated Chain Revert: Gas Limit Exceeded")
            
        return f"0xsimulated_hash_{random.randint(1000,9999)}"

class SettlementManager:
    def __init__(self, db: AsyncSession, adapter: SettlementAdapter = None):
        self.db = db
        self.adapter = adapter or SimulatedAdapter()

    async def process_pending_payments(self):
        """
        RTGS: Pick up CLEARED payments not yet in a Netting Cycle and settle them 1-by-1.
        NOTE: In Real world, we'd have a specific flag for 'RTGS Mode' vs 'DNS Mode'.
        Here we assume anything CLEARED and NOT NETTED is candidates for RTGS if we trigger this.
        """
        # Select CLEARED payments (RTGS candidate)
        stmt = select(Payment).where(Payment.status == PaymentStatus.CLEARED)
        result = await self.db.execute(stmt)
        payments = result.scalars().all()
        
        results = []
        for p in payments:
            # Move to PENDING
            p.status = PaymentStatus.PENDING_SETTLEMENT
            await self.db.flush()
            
            try:
                tx_hash = await self.adapter.settle(
                    reference=p.instruction_id,
                    debtor=p.debtor_agent_id,
                    creditor=p.creditor_agent_id,
                    amount=p.amount,
                    currency=p.currency
                )
                
                # Success
                p.status = PaymentStatus.SETTLED
                p.settlement_reference = tx_hash
                results.append({"id": p.instruction_id, "status": "SETTLED", "tx": tx_hash})
                
            except Exception as e:
                # Failure logic (Retry count would go here)
                p.status = PaymentStatus.FAILED
                p.reason_code = "BE01" # Tech error
                results.append({"id": p.instruction_id, "status": "FAILED", "error": str(e)})
        
        await self.db.commit()
        return results

    async def process_net_instructions(self, cycle_id: int):
        """
        DNS: Settle generated SettlementInstructions for a specific cycle.
        """
        stmt = select(SettlementInstruction).where(SettlementInstruction.cycle_id == cycle_id)
        result = await self.db.execute(stmt)
        instrs = result.scalars().all()
        
        results = []
        for i in instrs:
            if i.status == "SETTLED": continue

            try:
                tx_hash = await self.adapter.settle(
                    reference=i.id,
                    debtor=i.debtor_agent_id,
                    creditor=i.creditor_agent_id,
                    amount=i.amount,
                    currency=i.currency
                )
                
                i.status = "SETTLED"
                results.append({"id": i.id, "status": "SETTLED", "tx": tx_hash})
            except Exception as e:
                i.status = "FAILED"
                results.append({"id": i.id, "status": "FAILED", "error": str(e)})

        await self.db.commit()
        return results
