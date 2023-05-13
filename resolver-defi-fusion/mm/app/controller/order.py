import logging

from aioredis import Redis
from eth_account.messages import _hash_eip191_message
from eth_account.messages import encode_structured_data
from fastapi import APIRouter
from fastapi import BackgroundTasks
from fastapi import Depends
from fastapi import HTTPException
from web3.auto import w3
from app.blockchain.balance import check_balance
from app.config import cfg
from app.model.ins import Order
from app.model.ins import SubmitOrder
from app.model.outs import OrderSubmitted
from app.quote.quote import Token
from app.quote.quote import get_output_amount, FusionParams
from app.swap.swapper import Swapper
from app.utils.http.auth import HttpClientWithAuth
from app.utils.http.client import HttpClient
from app.utils.http.client import get_http_client
from app.utils.redis import get_redis
from app.fusion.fusion import place_order
import asyncio

logger = logging.getLogger(__name__)

router = APIRouter()

ORDER_STRUCT_TYPES = {
    'types': {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
        ],
        'Order': [
            {'name': 'fromActor', 'type': 'address'},
            {'name': 'fromChain', 'type': 'uint256'},
            {'name': 'fromToken', 'type': 'address'},
            {'name': 'fromAmount', 'type': 'uint256'},
            {'name': 'toActor', 'type': 'address'},
            {'name': 'toChain', 'type': 'uint256'},
            {'name': 'toToken', 'type': 'address'},
            {'name': 'toAmount', 'type': 'uint256'},
            {'name': 'collateralChain', 'type': 'uint256'},
            {'name': 'collateralAmount', 'type': 'uint256'},
            {'name': 'collateralUnlocked', 'type': 'uint256'},
            {'name': 'deadline', 'type': 'uint256'},
            {'name': 'nonce', 'type': 'uint256'},
        ],
    },
    'primaryType': 'Order',
}


def hash_from_order(order: Order) -> str:
    swap_struct = ORDER_STRUCT_TYPES.copy()
    message = {
        'fromActor': w3.to_checksum_address(order.from_actor),
        'fromChain': int(order.from_chain),
        'fromToken': w3.to_checksum_address(order.from_token),
        'fromAmount': int(order.from_amount),
        'toActor': w3.to_checksum_address(order.to_actor),
        'toChain': int(order.to_chain),
        'toToken': w3.to_checksum_address(order.to_token),
        'toAmount': int(order.to_amount),
        'collateralChain': int(order.collateral_chain),
        # 'collateralAmount': int(order.collateral_amount),
        'collateralAmount': 0,
        'collateralUnlocked': int(order.collateral_unlocked),
        'deadline': int(order.deadline),
        'nonce': int(order.nonce),
    }
    domain = {
        'name': 'KinetexFlash',
    }
    swap_struct['message'] = message
    swap_struct['domain'] = domain
    encoded = encode_structured_data(primitive=swap_struct)
    order_hash = _hash_eip191_message(encoded)
    return '0x' + order_hash.hex()  # pylint: disable=no-member


async def notify_backend(http: HttpClient, order_hash: str, send_tx: str, receive_tx: str) -> None:
    '''Temp method to notify backend. In future backend should do it by itself'''
    http_with_auth = HttpClientWithAuth(http, cfg.backend_auth)
    url = cfg.backend_url
    params = {
        'user_to_mm_tx': receive_tx,
        'mm_to_user_tx': send_tx,
    }
    await http_with_auth.patch(f'{url}/api/v0/swaps/{order_hash}', params)

async def wait_for_fusion_to_complete(http: HttpClient, chain_id: str, token: str, amount: int) -> None:
    logger.info('Waiting for fusion to complete %s, %s, %s', chain_id, token, amount)
    while True:
        balance = await check_balance(http, chain_id, token, cfg.maker.address)
        logger.info('Fetched balance -  %s/%s', balance, amount)
        if balance >= amount:
            logger.info('Got enough balance!')
            return
        logger.info('Not enough balance, sleeping')
        await asyncio.sleep(5)

async def make_swap(http: HttpClient, redis: Redis, data: SubmitOrder, fusion_params: FusionParams) -> None:
    order_hash = hash_from_order(data.order)
    logger.info('Swap proccess started for swap %s', order_hash)
    receiver = Swapper(http, redis, data.order.from_chain)
    _, receive_tx = await receiver.receive_order_asset(data.order, data.signature, data.permit_transaction)
    logger.info('Got receive tx %s for swap %s (%s chain)', receive_tx, order_hash, data.order.from_chain)

    if fusion_params.from_internal_token:
        logger.info('Initial chain fusion convert for swap %s', order_hash)
        await place_order(http, data.order.from_chain, data.order.from_token, fusion_params.from_internal_token, data.order.from_amount)
        logger.info('Initial chain fusion order placed for swap %s', order_hash)

    if fusion_params.to_internal_token:
        assert fusion_params.to_internal_amount
        logger.info('End chain fusion convert for swap %s', order_hash)
        await place_order(http, data.order.to_chain, fusion_params.to_internal_token, data.order.to_token, fusion_params.to_internal_amount)
        logger.info('End chain fusion order placed for swap %s', order_hash)
        await wait_for_fusion_to_complete(http, data.order.to_chain, data.order.to_token, data.order.to_amount)

    sender = Swapper(http, redis, data.order.to_chain)
    send_receipt, send_tx = await sender.send_order_asset(data.order)
    logger.info('Got send tx %s for swap %s (%s chain)', send_tx, order_hash, data.order.to_chain)

    logger.info('Swap %s completed', order_hash)
    await notify_backend(http, order_hash, send_tx, receive_tx)

    if int(data.order.collateral_amount) > 0:
        proof = await sender.get_send_proof(send_receipt)
        collateral_manager = Swapper(http, redis, data.order.collateral_chain)
        txid = await collateral_manager.confirm_order_asset_send(data.order, proof)
        logger.info('Collateral unlock for swap %s confirmed (tx %s)', order_hash, txid)


async def check_order(http: HttpClient, redis: Redis, data: SubmitOrder) -> FusionParams:
    from_token = Token(
        chain_id=data.order.from_chain,
        address=data.order.from_token.lower(),
    )
    to_token = Token(
        chain_id=data.order.to_chain,
        address=data.order.to_token.lower(),
    )
    to_amount, fusion_params = await get_output_amount(
        http, redis, from_token, to_token, int(data.order.from_amount), bool(data.permit_transaction)
    )
    if to_amount < int(data.order.to_amount):
        raise HTTPException(400, 'Rate expired')
    return fusion_params


@router.post(
    '/api/v0/order',
    tags=['Order'],
    summary='Submit order',
    description='Sends signed order',
    operation_id='submit_order',
    response_model=OrderSubmitted,
)
async def submit_order(
    data: SubmitOrder,
    background_tasks: BackgroundTasks,
    http: HttpClient = Depends(get_http_client),
    redis: Redis = Depends(get_redis),
) -> OrderSubmitted:
    fusion_params = await check_order(http, redis, data)
    background_tasks.add_task(
        make_swap,
        http,
        redis,
        data,
        fusion_params
    )
    return OrderSubmitted(ok=True)
