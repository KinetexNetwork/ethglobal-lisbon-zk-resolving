from enum import Enum

from pydantic import BaseModel
from pydantic import ConstrainedInt


class TokenAmount(ConstrainedInt):
    gt = 0


class PermitMode(str, Enum):
    PERMIT = 'permit'
    PERMIT2 = 'permit2'


class CreateSwap(BaseModel):
    from_chain_id: str
    to_chain_id: str
    from_token_address: str
    to_token_address: str
    from_amount: int
    user_address: str
    permit_transaction: str | None = None


class ConfirmSwap(BaseModel):
    signature: str


class EditSwap(BaseModel):
    user_to_mm_tx: str | None
    mm_to_user_tx: str | None
