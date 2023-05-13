import json
import logging
from datetime import datetime
from datetime import timedelta

from aioredis import Redis
from eth_account.messages import _hash_eip191_message
from eth_account.messages import encode_structured_data
from web3.auto import w3

from app.blockchain.node import ContractCallParams
from app.blockchain.node import Node
from app.config import cfg
from app.maker import MARKET_MAKERS_BY_SYMBOLS
from app.maker.exc import SendOrderException
from app.model.ins import EditSwap
from app.model.outs import Order
from app.model.outs import Quote
from app.model.outs import Swap
from app.model.outs import SwapState
from app.model.outs import TokenAmountStr
from app.model.outs import Transaction
from app.model.swap import CacheSwap
from app.utils.http.client import HttpClient

from .abi import ABI
from .exc import SwapAlreadyConfirmedException
from .exc import SwapNotFoundException
from .types import ORDER_STRUCT_TYPES


logger = logging.getLogger(__name__)
DEFAULT_ORDER_TTL = timedelta(hours=2)


CONTRACT = w3.eth.contract(abi=ABI)

TX_URL_TEMPLATES = {
    '1': 'https://etherscan.io/tx/%s',
    '100': 'https://gnosisscan.io/tx/%s',
    '250': 'https://ftmscan.io/tx/%s',
    '5': 'https://goerli.etherscan.io/tx/%s',
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


def data_from_order(order: Order) -> str:
    swap_struct = ORDER_STRUCT_TYPES.copy()

    message = {
        'fromActor': w3.to_checksum_address(order.from_actor),
        'fromChain': str(order.from_chain),
        'fromToken': w3.to_checksum_address(order.from_token),
        'fromAmount': str(order.from_amount),
        'toActor': w3.to_checksum_address(order.to_actor),
        'toChain': str(order.to_chain),
        'toToken': w3.to_checksum_address(order.to_token),
        'toAmount': str(order.to_amount),
        'collateralChain': str(order.collateral_chain),
        # 'collateralAmount': str(order.collateral_amount),
        'collateralAmount': '0',
        'collateralUnlocked': str(order.collateral_unlocked),
        'deadline': str(order.deadline),
        'nonce': str(order.nonce),
    }
    domain = {
        'name': 'KinetexFlash',
    }
    swap_struct['message'] = message
    swap_struct['domain'] = domain
    return json.dumps(swap_struct)


class Swapper:
    def __init__(self, http: HttpClient, redis: Redis) -> None:
        self._http = http
        self._redis = redis

    def _get_cache_key(self, hash_: str) -> str:
        return f'swap-{hash_}'

    async def cache_swap(self, swap: CacheSwap) -> None:
        await self._redis.set(self._get_cache_key(swap.swap.hash), swap.json())

    async def get_cache_swap(self, hash_: str) -> CacheSwap:
        data = await self._redis.get(self._get_cache_key(hash_))
        if not data:
            raise SwapNotFoundException(f'Swap {hash_} not found')
        swap = CacheSwap.parse_raw(data)
        return swap

    async def get_swap(self, hash_: str) -> Swap:
        cache_swap = await self.get_cache_swap(hash_)
        return cache_swap.swap

    def _get_nonce_key(self, chain_id: str, mm_address: str) -> str:
        return f'nonce-{chain_id}-{mm_address}-{cfg.contract.swapper_addresses[chain_id]}'

    async def get_nonce(self, chain_id: str, mm_address: str) -> int:
        nonce = await self._redis.get(self._get_nonce_key(chain_id, mm_address))
        return int(nonce or 0)

    async def set_nonce(self, chain_id: str, mm_address: str, nonce: int) -> None:
        await self._redis.set(self._get_nonce_key(chain_id, mm_address), str(nonce))

    async def increment_nonce(
        self,
        chain_id: str,
        mm_address: str,
    ) -> None:
        nonce = await self.get_nonce(chain_id, mm_address)
        await self.set_nonce(chain_id, mm_address, nonce + 1)

    async def get_collateral_unlocked(self, chain_id: str, collateral_chain_id: str, mm_address: str) -> int:
        node = Node(collateral_chain_id, self._http)
        data = CONTRACT.encodeABI('unlockedCollateralAmount', [w3.to_checksum_address(mm_address), int(chain_id)])
        params = ContractCallParams(
            from_address=None,
            contract_address=cfg.contract.swapper_addresses[collateral_chain_id],
            data=data,
            value=None,
        )
        result = await node.call(params)
        collateral_unlocked = w3.eth.codec.decode(('uint256',), result)
        return collateral_unlocked[0]

    async def create_swap(
        self,
        quote: Quote,
        user_address: str,
        permit_transaction: str | None,
        mm_symbol: str,
    ) -> Swap:
        collateral_unlocked = await self.get_collateral_unlocked(
            quote.from_chain_id, quote.collateral.chain_id, quote.market_maker.address
        )
        nonce = await self.get_nonce(quote.from_chain_id, quote.market_maker.address)
        await self.increment_nonce(quote.from_chain_id, quote.market_maker.address)
        order = Order(
            from_actor=user_address,
            from_chain=quote.from_chain_id,
            from_token=quote.from_token_address,
            from_amount=quote.from_amount,
            to_actor=quote.market_maker.address,
            to_chain=quote.to_chain_id,
            to_token=quote.to_token_address,
            to_amount=quote.to_amount,
            collateral_chain=quote.collateral.chain_id,
            collateral_amount=quote.collateral.amount,
            collateral_unlocked=TokenAmountStr(collateral_unlocked),
            deadline=int((datetime.now() + DEFAULT_ORDER_TTL).timestamp()),
            nonce=nonce,
        )

        swap = Swap(
            hash=hash_from_order(order),
            from_chain_id=quote.from_chain_id,
            to_chain_id=quote.to_chain_id,
            from_token_address=quote.from_token_address,
            to_token_address=quote.to_token_address,
            from_amount=quote.from_amount,
            to_amount=quote.to_amount,
            deadline=order.deadline,
            eta=quote.eta,
            market_maker=quote.market_maker,
            order_data=data_from_order(order),
            order=order,
            collateral=quote.collateral,
            state=SwapState.AWAITING_SIGNATURE,
            user_to_mm_tx=None,
            mm_to_user_tx=None,
        )
        cache_swap = CacheSwap(
            swap=swap,
            permit_transaction=permit_transaction,
            mm_symbol=mm_symbol,
        )
        await self.cache_swap(cache_swap)
        return swap

    async def confirm_swap(self, hash_: str, signature: str) -> Swap:
        cache_swap = await self.get_cache_swap(hash_)
        if cache_swap.swap.state != SwapState.AWAITING_SIGNATURE:
            raise SwapAlreadyConfirmedException(f'Swap {hash_} already confirmed')
        mm = MARKET_MAKERS_BY_SYMBOLS[cache_swap.mm_symbol]
        try:
            await mm.send_order(self._http, cache_swap.swap.order, signature, cache_swap.permit_transaction)
            setattr(cache_swap.swap, 'state', SwapState.AWAITING_TRANSACTIONS)
        except SendOrderException as e:
            logger.error('MM send oder error %s', str(e))
        await self.cache_swap(cache_swap)
        return cache_swap.swap

    async def edit_swap(self, hash_: str, edit_swap: EditSwap) -> Swap:
        cache_swap = await self.get_cache_swap(hash_)
        if edit_swap.user_to_mm_tx:
            tx = Transaction(
                chain_id=cache_swap.swap.from_chain_id,
                txid=edit_swap.user_to_mm_tx,
                explorer_url=TX_URL_TEMPLATES[cache_swap.swap.from_chain_id] % edit_swap.user_to_mm_tx,
            )
            setattr(cache_swap.swap, 'user_to_mm_tx', tx)
        if edit_swap.mm_to_user_tx:
            tx = Transaction(
                chain_id=cache_swap.swap.to_chain_id,
                txid=edit_swap.mm_to_user_tx,
                explorer_url=TX_URL_TEMPLATES[cache_swap.swap.to_chain_id] % edit_swap.mm_to_user_tx,
            )
            setattr(cache_swap.swap, 'mm_to_user_tx', tx)
            setattr(cache_swap.swap, 'state', SwapState.COMPLETED)
        await self.cache_swap(cache_swap)
        return cache_swap.swap
