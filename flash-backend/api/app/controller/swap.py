import asyncio
import logging

from aioredis import Redis
from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from app.blockchain.allowance import check_allowance
from app.blockchain.balance import check_balance
from app.config import cfg
from app.maker import mm0
from app.model.ins import ConfirmSwap
from app.model.ins import CreateSwap
from app.model.ins import EditSwap
from app.model.outs import Swap
from app.quote.quoter import Quoter
from app.quote.quoter import QuoterException
from app.swap.exc import SwapAlreadyConfirmedException
from app.swap.exc import SwapNotFoundException
from app.swap.swapper import Swapper
from app.utils.auth import authenticate
from app.utils.http.client import HttpClient
from app.utils.http.client import get_http_client
from app.utils.redis import get_redis


logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    '/api/v0/swaps',
    tags=['Swap'],
    summary='Create swap',
    description='Creates swap',
    operation_id='create_swap',
    response_model=Swap,
)
async def create_swap(
    data: CreateSwap,
    redis: Redis = Depends(get_redis),
    http: HttpClient = Depends(get_http_client),
) -> Swap:
    balance, allowance = await asyncio.gather(
        check_balance(http, data.from_chain_id, data.from_token_address, data.user_address),
        check_allowance(
            http,
            data.from_chain_id,
            data.from_token_address,
            data.user_address,
            cfg.contract.swapper_addresses[data.from_chain_id],
        ),
    )
    logger.info(
        'Attempt to create swap for user %s with %s balance and %s allowance', data.user_address, balance, allowance
    )
    if balance < data.from_amount:
        raise HTTPException(400, 'Insufficient user balance')
    if allowance < data.from_amount and data.permit_transaction is None:
        raise HTTPException(400, 'Insuficient allowance')
    quoter = Quoter(http, redis)
    try:
        quote, mm = await quoter.get_best_quote(
            data.from_chain_id,
            data.to_chain_id,
            data.from_token_address,
            data.to_token_address,
            data.from_amount,
            [mm0],
            bool(data.permit_transaction),
        )
    except QuoterException as e:
        raise HTTPException(400, str(e)) from e
    swapper = Swapper(http, redis)
    swap = await swapper.create_swap(quote, data.user_address, data.permit_transaction, mm.symbol)
    return swap


@router.get(
    '/api/v0/swaps/{swap_hash}',
    tags=['Swap'],
    summary='Get swap',
    description='Returns swap',
    operation_id='get_swap',
    response_model=Swap,
)
async def get_swap(
    swap_hash: str,
    redis: Redis = Depends(get_redis),
    http: HttpClient = Depends(get_http_client),
) -> Swap:
    swapper = Swapper(http, redis)
    try:
        swap = await swapper.get_swap(swap_hash)
    except SwapNotFoundException as e:
        raise HTTPException(400, str(e)) from e
    return swap


@router.post(
    '/api/v0/swaps/{swap_hash}/confirm',
    tags=['Swap'],
    summary='Confirm swap',
    description='Sends signed order to MM',
    operation_id='confirm_swap',
    response_model=Swap,
)
async def confirm_swap(
    swap_hash: str,
    data: ConfirmSwap,
    redis: Redis = Depends(get_redis),
    http: HttpClient = Depends(get_http_client),
) -> Swap:
    swapper = Swapper(http, redis)
    try:
        swap = await swapper.confirm_swap(swap_hash, data.signature)
    except SwapNotFoundException as e:
        raise HTTPException(400, str(e)) from e
    except SwapAlreadyConfirmedException as e:
        raise HTTPException(400, str(e)) from e
    return swap


@router.patch(
    '/api/v0/swaps/{swap_hash}',
    tags=['Swap'],
    summary='Edit swap',
    description='Changes swap state',
    operation_id='edit_swap',
    response_model=Swap,
    include_in_schema=cfg.spec.show_special,
)
async def edit_swap(
    swap_hash: str,
    data: EditSwap,
    _: None = Depends(authenticate),
    redis: Redis = Depends(get_redis),
    http: HttpClient = Depends(get_http_client),
) -> Swap:
    swapper = Swapper(http, redis)
    try:
        swap = await swapper.edit_swap(swap_hash, data)
    except SwapNotFoundException as e:
        raise HTTPException(400, str(e)) from e
    return swap
