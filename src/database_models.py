from datetime import datetime
from typing import Optional
from enum import Enum
from sqlalchemy import String, Integer, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Currency(str, Enum):
    USDC = "USDC"
    USDT = "USDT"
    EURC = "EURC"

class PaymentStatus(str, Enum):
    RECEIVED = "RECEIVED"
    VALIDATED = "VALIDATED"
    REJECTED = "REJECTED"
    CLEARED = "CLEARED"
    QUEUED = "QUEUED"
    NETTED = "NETTED"
    PENDING_SETTLEMENT = "PENDING_SETTLEMENT"
    SETTLED = "SETTLED"
    FAILED = "FAILED"
    REVERSED = "REVERSED"

class Participant(Base):
    __tablename__ = "participants"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # BIC / Agent ID
    name: Mapped[str] = mapped_column(String)
    api_key_hash: Mapped[Optional[str]] = mapped_column(String)
    
    # Account details
    account_number: Mapped[str] = mapped_column(String, unique=True)
    
    # Relationships
    sent_payments: Mapped[list["Payment"]] = relationship("Payment", foreign_keys="[Payment.debtor_agent_id]")
    received_payments: Mapped[list["Payment"]] = relationship("Payment", foreign_keys="[Payment.creditor_agent_id]")
    ledger_entries: Mapped[list["LedgerEntry"]] = relationship("LedgerEntry", back_populates="participant")

class Payment(Base):
    __tablename__ = "payments"

    instruction_id: Mapped[str] = mapped_column(String, primary_key=True)
    end_to_end_id: Mapped[str] = mapped_column(String, index=True)
    
    # Agents
    debtor_agent_id: Mapped[str] = mapped_column(ForeignKey("participants.id"))
    creditor_agent_id: Mapped[str] = mapped_column(ForeignKey("participants.id"))
    
    # Amounts
    amount: Mapped[str] = mapped_column(String) # Store as Decimal string
    currency: Mapped[Currency] = mapped_column(SQLEnum(Currency))
    
    # Status
    status: Mapped[PaymentStatus] = mapped_column(SQLEnum(PaymentStatus), default=PaymentStatus.RECEIVED)
    reason_code: Mapped[Optional[str]] = mapped_column(String)
    
    # Metadata
    value_date: Mapped[str] = mapped_column(String) # YYYY-MM-DD
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Settlement Info
    settlement_reference: Mapped[Optional[str]] = mapped_column(String) # Tx Hash

    # IVMS101 Data (Stored as JSON string if simple logic, or keep specifically if querying needed)
    # For MVP we can just store raw blob or rely on logs, but let's add a basic blob column
    ivms101_payload: Mapped[Optional[str]] = mapped_column(String) # JSON string representation

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    participant_id: Mapped[str] = mapped_column(ForeignKey("participants.id"))
    
    currency: Mapped[Currency] = mapped_column(SQLEnum(Currency))
    amount: Mapped[str] = mapped_column(String) # Positive for credit, negative for debit
    balance_after: Mapped[str] = mapped_column(String)
    
    reference_type: Mapped[str] = mapped_column(String) # DEPOSIT, WITHDRAWAL, PAYMENT_CLEARING, SETTLEMENT_NET
    reference_id: Mapped[str] = mapped_column(String)   # Instruction ID or Cycle ID
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    participant: Mapped["Participant"] = relationship("Participant", back_populates="ledger_entries")

class NettingCycle(Base):
    __tablename__ = "netting_cycles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, default="OPEN") # OPEN, CALCULATED, CLOSED
    
    # Snapshot of the net positions
    instructions: Mapped[list["SettlementInstruction"]] = relationship("SettlementInstruction", back_populates="cycle")

class SettlementInstruction(Base):
    __tablename__ = "settlement_instructions"

    id: Mapped[str] = mapped_column(String, primary_key=True) # UUID
    cycle_id: Mapped[int] = mapped_column(ForeignKey("netting_cycles.id"))
    
    debtor_agent_id: Mapped[str] = mapped_column(ForeignKey("participants.id"))
    creditor_agent_id: Mapped[str] = mapped_column(ForeignKey("participants.id"))
    
    amount: Mapped[str] = mapped_column(String)
    currency: Mapped[Currency] = mapped_column(SQLEnum(Currency))
    status: Mapped[str] = mapped_column(String, default="PENDING") # PENDING, SETTLED, FAILED
    
    cycle: Mapped["NettingCycle"] = relationship("NettingCycle", back_populates="instructions")
