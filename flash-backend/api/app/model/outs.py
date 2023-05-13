from datetime import timedelta
from enum import Enum

from pydantic import BaseModel

from .ins import PermitMode


class HealthStatus(BaseModel):
    healthy: bool


class IntString(str):
    def to_int(self) -> int:
        return int(self)


TokenAmountStr = IntString


class MarketMaker(BaseModel):
    address: str


class Collateral(BaseModel):
    chain_id: str
    token_address: str
    amount: TokenAmountStr


class Quote(BaseModel):
    from_chain_id: str
    to_chain_id: str
    from_token_address: str
    to_token_address: str
    from_amount: TokenAmountStr
    to_amount: TokenAmountStr
    eta: timedelta
    deadline: int
    market_maker: MarketMaker
    collateral: Collateral


class SwapState(str, Enum):
    AWAITING_SIGNATURE = 'awaiting_signature'
    AWAITING_TRANSACTIONS = 'awaiting_transactions'
    CANCELLED_NO_WITHDRAW = 'cancelled_no_withdraw'
    CANCELLED_AWAITING_WITHDRAW = 'cancelled_awaiting_withdraw'
    CANCELLED_WITHDRAWN = 'cancelled_withdrawn'
    COMPLETED = 'completed'


class Order(BaseModel):
    from_actor: str
    from_chain: str
    from_token: str
    from_amount: TokenAmountStr
    to_actor: str
    to_chain: str
    to_token: str
    to_amount: TokenAmountStr
    collateral_chain: str
    collateral_amount: TokenAmountStr
    collateral_unlocked: TokenAmountStr
    deadline: int
    nonce: int


class Transaction(BaseModel):
    chain_id: str
    txid: str
    explorer_url: str


class Swap(BaseModel):
    hash: str
    from_chain_id: str
    to_chain_id: str
    from_token_address: str
    to_token_address: str
    from_amount: TokenAmountStr
    to_amount: TokenAmountStr
    deadline: int
    eta: timedelta
    market_maker: MarketMaker
    collateral: Collateral
    order_data: str
    order: Order
    state: SwapState
    user_to_mm_tx: Transaction | None
    mm_to_user_tx: Transaction | None


class AllowanceInfo(BaseModel):
    chain_id: str
    token_address: str
    user_address: str
    contract_address: str
    allowance: TokenAmountStr
    allowance_p2: TokenAmountStr | None


class TransactionData(BaseModel):
    chain_id: str  # chain_id id where to deploy tx
    data: str  # hex input data
    value: TokenAmountStr | None  # amount of native coins to be send
    to_address: str  # contract address
    from_address: str  # user address


class PermitData(BaseModel):
    chain_id: str
    token_address: str
    user_address: str
    amount: TokenAmountStr | None
    deadline: int
    permit_data: str
    mode: PermitMode


class PermitTransaction(BaseModel):
    transaction: str
