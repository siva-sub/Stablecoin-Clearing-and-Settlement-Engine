from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from src.database_models import Payment, PaymentStatus, Currency, Participant
from src.domain_models import PaymentInstruction
from src.ledger.service import LedgerService
import json

class ClearingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ledger = LedgerService(db)

    async def validate_participants(self, instruction: PaymentInstruction) -> tuple[bool, str]:
        debtor_agent = await self.db.get(Participant, instruction.debtorAgent.agentId)
        if not debtor_agent:
            return False, f"Debtor Agent {instruction.debtorAgent.agentId} unknown"
            
        creditor_agent = await self.db.get(Participant, instruction.creditorAgent.agentId)
        if not creditor_agent:
            return False, f"Creditor Agent {instruction.creditorAgent.agentId} unknown"
            
        return True, ""

    async def validation_checks(self, instruction: PaymentInstruction) -> tuple[bool, str]:
        # 1. Structural Validation (handled by Pydantic mostly)
        # 2. Compliance Checks
        amount = Decimal(instruction.amount)
        if amount >= Decimal("1000.00"):
            if not instruction.ivms101:
                return False, "IVMS101 data required for amounts >= 1000"
            # TODO: Add specific IVMS validation logic here
            
        # 3. Sanctions Stub
        # if instruction.debtorAgent.agentId in SANCTIONED_LIST: return False...
        
        return True, ""

    async def process_instruction(self, instruction: PaymentInstruction) -> Payment:
        # Create Payment record in RECEIVED state
        payment = Payment(
            instruction_id=instruction.instructionId,
            end_to_end_id=instruction.endToEndId or instruction.instructionId,
            debtor_agent_id=instruction.debtorAgent.agentId,
            creditor_agent_id=instruction.creditorAgent.agentId,
            amount=instruction.amount,
            currency=Currency(instruction.currency),
            status=PaymentStatus.RECEIVED,
            value_date=instruction.valueDate,
            ivms101_payload=json.dumps(instruction.ivms101.model_dump(by_alias=True)) if instruction.ivms101 else None
        )
        self.db.add(payment)
        await self.db.flush() # Get ID, but don't commit yet
        
        # Step 1: Validate Participants
        valid_part, error_part = await self.validate_participants(instruction)
        if not valid_part:
            payment.status = PaymentStatus.REJECTED
            payment.reason_code = "AG01" # Agent error
            return payment

        # Step 2: Compliance/Schema Validation
        payment.status = PaymentStatus.VALIDATED
        valid_comp, error_comp = await self.validation_checks(instruction)
        if not valid_comp:
            payment.status = PaymentStatus.REJECTED
            payment.reason_code = "RR04" # Regulatory Reason
            return payment
            
        # Step 3: Liquidity Check & Reservation (Clearing)
        reserved = await self.ledger.reserve_funds(
            participant_id=instruction.debtorAgent.agentId, 
            currency=Currency(instruction.currency), 
            amount=Decimal(instruction.amount),
            reference_id=instruction.instructionId
        )
        
        if reserved:
            payment.status = PaymentStatus.CLEARED
            # In RTGS mode, we might auto-move to PENDING_SETTLEMENT here
            # For now, leave as CLEARED, let orchestration pick it up
        else:
            payment.status = PaymentStatus.REJECTED
            payment.reason_code = "AM04" # Insufficient Funds

        return payment
