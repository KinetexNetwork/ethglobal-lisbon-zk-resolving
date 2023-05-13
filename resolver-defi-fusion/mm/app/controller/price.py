from datetime import datetime
from datetime import timedelta
from decimal import Decimal

from fastapi import APIRouter

from app.model.outs import PriceLevel
from app.model.outs import PriceLevels
from app.model.outs import PriceLevelsInfo
from app.model.outs import Token
from app.model.outs import TokenPair


LEVELS_TTL = timedelta(minutes=1)

router = APIRouter()

usdt = Token(
    address='0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'.lower(),
    chain_id='100',
    decimals=6,
)

dai = Token(
    address='0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E'.lower(),
    chain_id='250',
    decimals=18,
)

pair = TokenPair(
    from_token=usdt,
    to_token=dai,
)


@router.get(
    '/api/v0/price/levels',
    tags=['Price'],
    summary='Get price levels',
    description='Returns price levels',
    operation_id='get_price_levels',
    response_model=PriceLevelsInfo,
)
async def get_price_levels() -> PriceLevelsInfo:
    info = PriceLevelsInfo(
        levels=[
            PriceLevels(
                pair=pair,
                levels=[
                    PriceLevel(level=Decimal(0.1), price=Decimal(1)),
                    PriceLevel(level=Decimal(1_000), price=Decimal(1)),
                ],
            )
        ],
        expires_at=datetime.now() + LEVELS_TTL,
    )
    return info
