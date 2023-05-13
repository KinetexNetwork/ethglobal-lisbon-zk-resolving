from datetime import datetime
from datetime import timedelta
from decimal import Decimal

from pydantic import BaseModel


class HealthStatus(BaseModel):
    healthy: bool


class Token(BaseModel):
    address: str
    chain_id: str
    decimals: int


class TokenPair(BaseModel):
    from_token: Token
    to_token: Token


class PriceLevel(BaseModel):
    level: Decimal
    price: Decimal


class PriceLevels(BaseModel):
    pair: TokenPair
    levels: list[PriceLevel]


class PriceLevelsInfo(BaseModel):
    levels: list[PriceLevels]
    expires_at: datetime


class OrderSubmitted(BaseModel):
    ok: bool


class Collateral(BaseModel):
    chain_id: str
    amount: int


class Quote(BaseModel):
    from_chain_id: str
    to_chain_id: str
    from_token_address: str
    to_token_address: str
    from_amount: int
    to_amount: int
    eta: timedelta
    deadline: int
    collateral: Collateral
