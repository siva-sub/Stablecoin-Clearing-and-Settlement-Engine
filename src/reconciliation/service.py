from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.database_models import Payment, PaymentStatus, SettlementInstruction

class ReconciliationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def run_daily_recon(self):
        """
        Compare Internal DB vs 'External Chain'.
        For MVP, we assume External Chain confirms everything that has a settlement_reference.
        """
        results = {
            "total_checked": 0,
            "mismatches": [],
            "status": "GREEN"
        }
        
        # 1. Check Payments (RTGS)
        stmt = select(Payment).where(Payment.status == PaymentStatus.SETTLED)
        payments = (await self.db.execute(stmt)).scalars().all()
        
        for p in payments:
            results["total_checked"] += 1
            if not p.settlement_reference:
                results["mismatches"].append(f"Payment {p.instruction_id} is SETTLED but missing tx hash")
                
        # 2. Check Netting Instructions
        stmt = select(SettlementInstruction).where(SettlementInstruction.status == "SETTLED")
        instrs = (await self.db.execute(stmt)).scalars().all()
        
        for i in instrs:
             results["total_checked"] += 1
             # In a real app we would call: adapter.get_transaction_status(i.tx_hash)
        
        if results["mismatches"]:
            results["status"] = "RED"
            
        return results
