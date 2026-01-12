import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app
from src.database_models import Base
from src.database import engine

# Scenario:
# A -> B: 100
# B -> C: 40
# C -> A: 20
# A -> C: 10
#
# Net Positions:
# A: -100 (sent) + 20 (recv) - 10 (sent) = -90  => PAYS 90
# B: +100 (recv) - 40 (sent) = +60              => RECEIVES 60
# C: +40 (recv) - 20 (sent) + 10 (recv) = +30   => RECEIVES 30
# Sum: -90 + 60 + 30 = 0. Perfect.

@pytest.mark.asyncio
async def test_netting_scenario():
    # Setup DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Create Participants
        for p in ["BANK_A", "BANK_B", "BANK_C"]:
            await ac.post(f"/participants?id={p}&name={p}")
            await ac.post(f"/participants/{p}/deposit?amount=1000&currency=USDC")

        # 2. Submit Payments
        payments = [
            ("BANK_A", "BANK_B", "100.00"),
            ("BANK_B", "BANK_C", "40.00"),
            ("BANK_C", "BANK_A", "20.00"),
            ("BANK_A", "BANK_C", "10.00"),
        ]
        
        for i, (src, dst, amt) in enumerate(payments):
            resp = await ac.post("/payments", json={
                "instructionId": f"TX-{i}",
                "debtorAgent": {"agentId": src},
                "creditorAgent": {"agentId": dst},
                "amount": amt,
                "currency": "USDC",
                "valueDate": "2023-01-01"
            })
            assert resp.status_code == 202, resp.text
            assert resp.json()["status"] == "CLEARED"

        # 3. Trigger Netting
        resp = await ac.post("/netting/run")
        assert resp.status_code == 200
        data = resp.json()
        cycle_id = data["cycle_id"]
        
        print(f"Cycle ID: {cycle_id}")  

        # 4. Verify Instructions (Direct DB check)
        # We need to query the DB to see the instructions
        from src.database import AsyncSessionLocal
        from src.database_models import SettlementInstruction
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            stmt = select(SettlementInstruction).where(SettlementInstruction.cycle_id == cycle_id)
            result = await session.execute(stmt)
            instrs = result.scalars().all()
            
            # Map: Agent -> Net Amount Impact
            # If Agent is Debtor -> -Amount
            # If Agent is Creditor -> +Amount
            # (Assuming SCSE_POOL is the counterparty)
            
            net_map = {"BANK_A": 0, "BANK_B": 0, "BANK_C": 0}
            
            for instr in instrs:
                print(f"Instr: {instr.debtor_agent_id} -> {instr.creditor_agent_id}: {instr.amount}")
                amt = float(instr.amount)
                
                if instr.debtor_agent_id == "SCSE_POOL":
                    # Pool pays Agent => Agent receives (Credit)
                    net_map[instr.creditor_agent_id] += amt
                elif instr.creditor_agent_id == "SCSE_POOL":
                    # Agent pays Pool => Agent sends (Debit)
                    net_map[instr.debtor_agent_id] -= amt
            
            print("Net Positions:", net_map)
            
            assert net_map["BANK_A"] == -90.0
            assert net_map["BANK_B"] == 60.0
            assert net_map["BANK_C"] == 30.0

if __name__ == "__main__":
    # Helper to run without pytest CLI for quick check
    loop = asyncio.new_event_loop()
    loop.run_until_complete(test_netting_scenario())
