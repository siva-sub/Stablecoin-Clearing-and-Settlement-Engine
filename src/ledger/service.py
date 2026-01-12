from typing import Optional
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from src.database_models import Participant, LedgerEntry, Currency

class LedgerService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_balance(self, participant_id: str, currency: Currency) -> Decimal:
        """
        Calculate current balance by summing all ledger entries.
        Real implementation might cache this or use a balance snapshot table.
        """
        # For MVP, we sum entries on the fly or rely on a simplified model.
        # Let's assume we might just query a balance column if we had one, 
        # but for strictness let's sum.
        # However, for MVP speed, let's assume we query ledger entries.
        # Better yet, let's just stick to the snapshot/cache approach for MVP simplicity 
        # or just trust the prefunding check logic which is critical.
        
        # Let's actually use a calculated balance query:
        # SUM(amount) where participant_id = id
        
        # NOTE: In a real system you'd separate "Available" vs "Ledger" balance.
        # Here we just check if net sum > 0.
        
        # Optimisation: We didn't put a current_balance on Participant, maybe we should have?
        # Let's keep it pure ledger for now.
        
        # For this MVP, let's do a simple thing: just check entries.
        # Wait, for an MVP, traversing all entries every time is slow.
        # Let's mock it by assuming Participant has a balance field we update, 
        # even though that's less "pure". 
        # Actually, let's just do the sum. It's SQLite. It'll be fine for <10k rows.
        
        stmt = select(LedgerEntry).where(
            LedgerEntry.participant_id == participant_id,
            LedgerEntry.currency == currency
        )
        result = await self.db.execute(stmt)
        entries = result.scalars().all()
        
        balance = sum(Decimal(entry.amount) for entry in entries)
        return balance

    async def check_funds_available(self, participant_id: str, currency: Currency, amount: Decimal) -> bool:
        current_balance = await self.get_balance(participant_id, currency)
        return current_balance >= amount

    async def reserve_funds(self, participant_id: str, currency: Currency, amount: Decimal, reference_id: str) -> bool:
        """
        Debit the participant to reserve funds for a payment.
        In a real system this might move funds to a "Locked" state.
        Here we simply DEBIT the participant immediately to prevent double spend.
        If settlement fails, we credit them back (reversal).
        """
        if not await self.check_funds_available(participant_id, currency, amount):
            return False
            
        entry = LedgerEntry(
            participant_id=participant_id,
            currency=currency,
            amount=str(-amount), # Negative for DEBIT
            balance_after="0", # TODO: Calculate this if needed for reporting
            reference_type="PAYMENT_RESERVATION",
            reference_id=reference_id
        )
        self.db.add(entry)
        # Check constraints or concurrency handling would be here (SELECT FOR UPDATE)
        return True

    async def deposit_funds(self, participant_id: str, currency: Currency, amount: Decimal, reference_id: str = "MANUAL_DEPOSIT"):
        """
        Credit funds to a participant (e.g. initial prefunding).
        """
        entry = LedgerEntry(
            participant_id=participant_id,
            currency=currency,
            amount=str(amount),
            balance_after="0",
            reference_type="DEPOSIT",
            reference_id=reference_id
        )
        self.db.add(entry)
