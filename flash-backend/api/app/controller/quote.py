from aioredis import Redis
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from app.maker import mm0
from app.model.outs import Quote
from app.quote.quoter import Quoter
from app.quote.quoter import QuoterException
from app.utils.http.client import HttpClient
from app.utils.http.client import get_http_client
from app.utils.redis import get_redis


router = APIRouter()


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
    redis: Redis = Depends(get_redis),
    http: HttpClient = Depends(get_http_client),
) -> Quote:
    quoter = Quoter(http, redis)
    try:
        quote, _ = await quoter.get_best_quote(
            from_chain_id,
            to_chain_id,
            from_token_address,
            to_token_address,
            from_amount,
            [mm0],
        )
    except QuoterException as e:
        raise HTTPException(400, str(e)) from e
    return quote
