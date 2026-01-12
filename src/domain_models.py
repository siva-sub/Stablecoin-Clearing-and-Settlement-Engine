from typing import Optional, List, Literal
from pydantic import BaseModel, Field, validator
from datetime import date as date_type

# --- IVMS101 Sub-Models ---

class NameIdentifier(BaseModel):
    primaryIdentifier: str
    secondaryIdentifier: Optional[str] = None
    nameIdentifierType: Literal["ALIA", "BIRT", "MAID", "LEGL", "MISC"]

class NaturalPersonName(BaseModel):
    nameIdentifier: List[NameIdentifier]

class NaturalPerson(BaseModel):
    name: NaturalPersonName
    # simplified for MVP
    dateAndPlaceOfBirth: Optional[dict] = None
    countryOfResidence: Optional[str] = None

class LegalPersonNameIdentifier(BaseModel):
    legalPersonName: str
    legalPersonNameIdentifierType: Literal["LEGL", "SHRT", "TRAD"]

class LegalPersonName(BaseModel):
    nameIdentifier: List[LegalPersonNameIdentifier]

class LegalPerson(BaseModel):
    name: LegalPersonName
    countryOfRegistration: Optional[str] = None

class OriginatorPerson(BaseModel):
    naturalPerson: Optional[NaturalPerson] = None
    legalPerson: Optional[LegalPerson] = None

class BeneficiaryPerson(BaseModel):
    naturalPerson: Optional[NaturalPerson] = None
    legalPerson: Optional[LegalPerson] = None

class Originator(BaseModel):
    originatorPersons: List[OriginatorPerson]
    accountNumber: List[str]

class Beneficiary(BaseModel):
    beneficiaryPersons: List[BeneficiaryPerson]
    accountNumber: List[str]

class IVMS101Payload(BaseModel):
    originator: Optional[Originator] = Field(None, alias="Originator")
    beneficiary: Optional[Beneficiary] = Field(None, alias="Beneficiary")

# --- Main Payment Models ---

class Agent(BaseModel):
    agentId: str = Field(..., description="BIC or ID of the Financial Institution")
    account: Optional[str] = None

class PaymentInstruction(BaseModel):
    instructionId: str
    endToEndId: Optional[str] = None
    debtorAgent: Agent
    creditorAgent: Agent
    amount: str = Field(..., pattern=r"^[0-9]+(\.[0-9]{1,18})?$")
    currency: Literal["USDC", "USDT", "EURC"]
    valueDate: str # Keep as string for simplicity in JSON, or use date_type
    priority: Literal["HIGH", "NORMAL"] = "NORMAL"
    remittanceInfo: Optional[str] = Field(None, max_length=140)
    ivms101: Optional[IVMS101Payload] = None
    signature: Optional[str] = None

class PaymentStatusResponse(BaseModel):
    instructionId: str
    status: str
    reasonCode: Optional[str] = None
    timestamp: str
    settlementReference: Optional[str] = None

class BalanceResponse(BaseModel):
    participantId: str
    currency: str
    amount: str
    updatedAt: str
