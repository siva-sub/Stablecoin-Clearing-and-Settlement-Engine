import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from src.main import app
from src.database_models import Base
from src.database import engine

@pytest.mark.asyncio
async def test_settlement_flows():
    # Setup DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Prerequisites
        for p in ["BANK_A", "BANK_B", "BANK_C"]:
            await ac.post(f"/participants?id={p}&name={p}")
            await ac.post(f"/participants/{p}/deposit?amount=1000&currency=USDC")

        # --- Test 1: RTGS Flow ---
        print("\n--- Testing RTGS Flow ---")
        resp = await ac.post("/payments", json={
            "instructionId": "TX-RTGS-01",
            "debtorAgent": {"agentId": "BANK_A"},
            "creditorAgent": {"agentId": "BANK_B"},
            "amount": "100.00",
            "currency": "USDC",
            "valueDate": "2023-01-01"
        })
        assert resp.json()["status"] == "CLEARED"

        # Trigger RTGS Settlement
        resp = await ac.post("/settlement/process-rtgs")
        assert resp.status_code == 200
        data = resp.json()
        assert data["processed"] == 1
        assert data["results"][0]["status"] == "SETTLED"
        print(f"RTGS Result: {data}")

        # --- Test 2: DNS Flow ---
        print("\n--- Testing DNS Flow ---")
        # Submit 2 payments: A->B, B->A
        await ac.post("/payments", json={
            "instructionId": "TX-DNS-01",
            "debtorAgent": {"agentId": "BANK_A"},
            "creditorAgent": {"agentId": "BANK_B"},
            "amount": "50.00",
            "currency": "USDC",
            "valueDate": "2023-01-01"
        })
        await ac.post("/payments", json={
            "instructionId": "TX-DNS-02",
            "debtorAgent": {"agentId": "BANK_B"},
            "creditorAgent": {"agentId": "BANK_A"},
            "amount": "20.00",
            "currency": "USDC",
            "valueDate": "2023-01-01"
        })
        
        # Run Netting
        resp = await ac.post("/netting/run")
        cycle_id = resp.json()["cycle_id"]
        
        # Trigger Cycle Settlement
        resp = await ac.post(f"/settlement/process-cycle/{cycle_id}")
        assert resp.status_code == 200
        data = resp.json()
        print(f"DNS Result: {data}")
        # Expect 2 instructions: A->Pool (30), Pool->B (30) ... Wait, 
        # A net: -50 + 20 = -30 (Pays 30)
        # B net: +50 - 20 = +30 (Receives 30)
        # So 2 instructions.
        assert data["processed"] == 2
        for res in data["results"]:
            assert res["status"] == "SETTLED"

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(test_settlement_flows())
