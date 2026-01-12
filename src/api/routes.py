from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from decimal import Decimal
from src.database import get_db
from src.domain_models import PaymentInstruction, PaymentStatusResponse, BalanceResponse
from src.database_models import Payment, Participant, Currency
from src.clearing.service import ClearingService
from src.ledger.service import LedgerService
from src.netting.service import NettingService
from src.settlement.service import SettlementManager
from src.reconciliation.service import ReconciliationService

router = APIRouter()

# --- Participants ---

@router.post("/participants")
async def create_participant(id: str, name: str, db: AsyncSession = Depends(get_db)):
    """Helper to seed participants"""
    try:
        p = Participant(id=id, name=name, account_number=f"ACCT-{id}")
        db.add(p)
        await db.commit()
    except Exception:
        # Likely already exists
        await db.rollback()
        return {"status": "exists", "id": id}
    return {"status": "created", "id": id}

@router.post("/participants/{id}/deposit")
async def deposit_funds(id: str, amount: str, currency: str, db: AsyncSession = Depends(get_db)):
    """Helper to seed funds"""
    ledger = LedgerService(db)
    await ledger.deposit_funds(id, Currency(currency), Decimal(amount))
    await db.commit()
    return {"status": "deposited", "new_balance": amount}

@router.get("/participants/{id}/balance/{currency}", response_model=BalanceResponse)
async def get_balance(id: str, currency: str, db: AsyncSession = Depends(get_db)):
    ledger = LedgerService(db)
    balance = await ledger.get_balance(id, Currency(currency))
    return BalanceResponse(
        participantId=id,
        currency=currency,
        amount=str(balance),
        updatedAt="now" # placeholder
    )

# --- Payments ---

@router.post("/payments", response_model=PaymentStatusResponse, status_code=202)
async def submit_payment(
    instruction: PaymentInstruction, 
    db: AsyncSession = Depends(get_db)
):
    clearing = ClearingService(db)
    try:
        payment = await clearing.process_instruction(instruction)
        await db.commit()
        
        return PaymentStatusResponse(
            instructionId=payment.instruction_id,
            status=payment.status.value,
            reasonCode=payment.reason_code,
            timestamp=str(payment.updated_at),
            settlementReference=payment.settlement_reference
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payments")
async def list_payments(db: AsyncSession = Depends(get_db)):
    """List recent payments for dashboard"""
    # Note: In real app, add pagination
    result = await db.execute(select(Payment).order_by(Payment.created_at.desc()).limit(20))
    payments = result.scalars().all()
    
    return [
        {
            "instruction_id": p.instruction_id,
            "debtor_agent_id": p.debtor_agent_id,
            "creditor_agent_id": p.creditor_agent_id,
            "amount": p.amount,
            "currency": p.currency.value,
            "status": p.status.value,
            "settlement_reference": p.settlement_reference,
            "timestamp": str(p.updated_at)
        }
        for p in payments
    ]

@router.get("/payments/{id}", response_model=PaymentStatusResponse)
async def get_payment_status(id: str, db: AsyncSession = Depends(get_db)):
    payment = await db.get(Payment, id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
        
    return PaymentStatusResponse(
        instructionId=payment.instruction_id,
        status=payment.status.value,
        reasonCode=payment.reason_code,
        timestamp=str(payment.updated_at),
        settlementReference=payment.settlement_reference
    )

# --- Netting ---

@router.post("/netting/run")
async def run_netting(db: AsyncSession = Depends(get_db)):
    """Trigger a netting cycle"""
    service = NettingService(db)
    cycle = await service.run_netting_cycle()
    return {
        "cycle_id": cycle.id,
        "status": cycle.status,
        "timestamp": str(cycle.end_time)
    }

# --- Settlement ---

@router.post("/settlement/process-rtgs")
async def process_rtgs(db: AsyncSession = Depends(get_db)):
    """Trigger settlement for all CLEARED payments (RTGS mode)"""
    mgr = SettlementManager(db)
    results = await mgr.process_pending_payments()
    return {"processed": len(results), "results": results}

@router.post("/settlement/process-cycle/{cycle_id}")
async def process_netting_settlement(cycle_id: int, db: AsyncSession = Depends(get_db)):
    """Trigger settlement for a netting cycle"""
    mgr = SettlementManager(db)
    results = await mgr.process_net_instructions(cycle_id)
    return {"processed": len(results), "results": results}

# --- Reconciliation ---

@router.post("/reconciliation/run")
async def run_reconciliation(db: AsyncSession = Depends(get_db)):
    """Run daily reconciliation check"""
    service = ReconciliationService(db)
    return await service.run_daily_recon()

