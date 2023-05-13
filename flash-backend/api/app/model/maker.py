from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


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
