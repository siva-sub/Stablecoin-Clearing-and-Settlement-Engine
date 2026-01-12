import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.database_models import Payment, PaymentStatus, NettingCycle, SettlementInstruction, Currency, Participant

SCSE_POOL_ID = "SCSE_POOL"

class NettingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def run_netting_cycle(self) -> NettingCycle:
        # 1. Start Cycle
        cycle = NettingCycle(status="CALCULATING")
        self.db.add(cycle)
        await self.db.flush()
        
        # 2. Fetch Eligible Payments (CLEARED)
        # In a real system, you'd lock these rows or move them to a 'LOCKED' state first.
        stmt = select(Payment).where(Payment.status == PaymentStatus.CLEARED)
        result = await self.db.execute(stmt)
        payments = result.scalars().all()
        
        if not payments:
            cycle.status = "CLOSED_NO_DATA"
            cycle.end_time = datetime.utcnow()
            await self.db.commit()
            return cycle

        # 3. Calculate Net Positions (Multilateral)
        # Map: ParticipantID -> Currency -> NetAmount (Decimal)
        net_positions = {} 
        
        for p in payments:
            ccy = p.currency
            amt = Decimal(p.amount)
            
            # Debtor sends money (Negative impact on distinct net position? No, 
            # Net Position = Entitlement. 
            # If I pay, my position decreases. If I receive, it increases.
            
            # Debtor
            d_id = p.debtor_agent_id
            if d_id not in net_positions: net_positions[d_id] = {}
            if ccy not in net_positions[d_id]: net_positions[d_id][ccy] = Decimal(0)
            net_positions[d_id][ccy] -= amt
            
            # Creditor
            c_id = p.creditor_agent_id
            if c_id not in net_positions: net_positions[c_id] = {}
            if ccy not in net_positions[c_id]: net_positions[c_id][ccy] = Decimal(0)
            net_positions[c_id][ccy] += amt
            
            # Update Payment Status
            p.status = PaymentStatus.NETTED
            # In a real app we'd link p.netting_cycle_id = cycle.id

        # 4. Generate Settlement Instructions
        instructions = []
        
        for agent_id, currencies in net_positions.items():
            for ccy, net_amount in currencies.items():
                if net_amount == 0:
                    continue
                
                instr_id = str(uuid.uuid4())
                
                if net_amount < 0:
                    # Agent owes the pool
                    # Amount to pay is abs(net_amount)
                    amount_str = str(abs(net_amount))
                    instr = SettlementInstruction(
                        id=instr_id,
                        cycle_id=cycle.id,
                        debtor_agent_id=agent_id,
                        creditor_agent_id=SCSE_POOL_ID,
                        amount=amount_str,
                        currency=ccy,
                        status="PENDING"
                    )
                else:
                    # Pool owes the agent
                    amount_str = str(net_amount)
                    instr = SettlementInstruction(
                        id=instr_id,
                        cycle_id=cycle.id,
                        debtor_agent_id=SCSE_POOL_ID,
                        creditor_agent_id=agent_id,
                        amount=amount_str,
                        currency=ccy,
                        status="PENDING"
                    )
                self.db.add(instr)
                
        # 5. Finalize Cycle
        cycle.status = "CLOSED"
        cycle.end_time = datetime.utcnow()
        await self.db.commit()
        
        return cycle
