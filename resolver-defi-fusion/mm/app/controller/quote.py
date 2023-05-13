import asyncio
from datetime import datetime
from datetime import timedelta

from aioredis import Redis
from fastapi import APIRouter
from fastapi import Depends

from app.config import cfg
from app.model.outs import Collateral
from app.model.outs import Quote
from app.quote.quote import Token
from app.quote.quote import get_collateral_amount
from app.quote.quote import get_quote_amount
from app.utils.http.client import HttpClient
from app.utils.http.client import get_http_client
from app.utils.redis import get_redis


router = APIRouter()


DEFAULT_ETA = timedelta(seconds=30)
DEFAULT_TTL = timedelta(minutes=15)


@router.get(
    '/api/v0/quote',
    tags=['Quote'],
    summary='Get quote',
    description='Returns quote',
    operation_id='get_quote',
    response_model=Quote,
)
async def get_quote(
    from_chain_id: str,
    to_chain_id: str,
    from_token_address: str,
    to_token_address: str,
    from_amount: int,
    need_permit: bool = False,
    http: HttpClient = Depends(get_http_client),
    redis: Redis = Depends(get_redis),
) -> Quote:
    from_token = Token(
        chain_id=from_chain_id,
        address=from_token_address.lower(),
    )
    to_token = Token(
        chain_id=to_chain_id,
        address=to_token_address.lower(),
    )
    to_amount, collateral_amount = await asyncio.gather(
        get_quote_amount(http, redis, from_token, to_token, from_amount, need_permit),
        get_collateral_amount(http, from_token, from_amount),
    )

    return Quote(
        from_chain_id=from_chain_id,
        to_chain_id=to_chain_id,
        from_token_address=from_token_address,
        to_token_address=to_token_address,
        from_amount=from_amount,
        to_amount=to_amount,
        eta=DEFAULT_ETA,
        deadline=int((datetime.now() + DEFAULT_TTL).timestamp()),
        collateral=Collateral(
            chain_id=cfg.contract.collateral_chain,
            amount=collateral_amount,
        ),
    )
