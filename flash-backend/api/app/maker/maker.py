from datetime import datetime
from datetime import timedelta

from aioredis import Redis
from pydantic import BaseModel

from app.model.maker import PriceLevels
from app.model.maker import PriceLevelsInfo
from app.model.maker import TokenPair as MMTokenPair
from app.model.outs import MarketMaker
from app.model.outs import Order
from app.model.pair import TokenPair
from app.utils.convert import dec_to_int
from app.utils.convert import int_to_dec
from app.utils.http.client import HttpClient
from app.utils.http.exc import HttpClientException
from app.utils.redis.cached_value import RedisCachedValue

from .exc import SendOrderException
import logging

logger = logging.getLogger(__name__)

class PriceLevelsCacheInfo(BaseModel):
    levels: dict[str, PriceLevels]
    ttl: timedelta


def pair_to_str(pair: TokenPair | MMTokenPair) -> str:
    return f'{pair.from_token.chain_id}-{pair.from_token.address}->{pair.to_token.chain_id}-{pair.to_token.address}'


class MMCollateral(BaseModel):
    chain_id: str
    amount: int


class MMQuote(BaseModel):
    to_amount: int
    collateral: MMCollateral
    eta: timedelta
    deadline: int


class Maker:
    def __init__(self, symbol: str, info: MarketMaker, url: str) -> None:
        self.symbol = symbol
        self.info = info
        self._url = url

    async def get_price_levels(self, http: HttpClient, redis: Redis) -> PriceLevelsCacheInfo:
        async def load_levels() -> PriceLevelsCacheInfo:
            result = await http.get(f'{self._url}/api/v0/price/levels')
            info = PriceLevelsInfo.parse_obj(result)
            cache_info = PriceLevelsCacheInfo(
                levels={pair_to_str(levels.pair): levels for levels in info.levels},
                ttl=info.expires_at - datetime.now(),
            )
            return cache_info

        redis_cache = RedisCachedValue(
            redis=redis,
            model=PriceLevelsCacheInfo,
            key=f'maker-{self.symbol}-price-levels',
            load=load_levels,
            get_ttl_from_model=lambda x: x.ttl,
        )
        return await redis_cache.get_value()

    def quote_from_levels(self, levels_info: PriceLevelsCacheInfo, pair: TokenPair, amount: int) -> int:
        levels = levels_info.levels[pair_to_str(pair)]
        dec_amount = int_to_dec(amount, levels.pair.from_token.decimals)
        sorted_levels = sorted(levels.levels, key=lambda x: x.level)
        if dec_amount < sorted_levels[0].level:
            return 0
        if dec_amount > sorted_levels[-1].level:
            return 0
        price = next(level.price for level in sorted_levels if level.level >= dec_amount)
        output_amount = price * dec_amount

        return dec_to_int(output_amount, levels.pair.to_token.decimals)

    # async def quote(self, http: HttpClient, redis: Redis, pair: TokenPair, amount: int) -> int:
    #     levels = await self.get_price_levels(http, redis)
    #     return self.quote_from_levels(levels, pair, amount)

    async def quote(
        self,
        http: HttpClient,
        from_chain_id: str,
        to_chain_id: str,
        from_token_address: str,
        to_token_address: str,
        from_amount: int,
        permit: bool = False,
    ) -> MMQuote | None:
        params = {
            'from_chain_id': from_chain_id,
            'to_chain_id': to_chain_id,
            'from_token_address': from_token_address,
            'to_token_address': to_token_address,
            'from_amount': from_amount,
            'need_permit': permit,
        }
        try:
            result = await http.get(f'{self._url}/api/v0/quote', params)
        except HttpClientException as e:
            logger.error(str(e))
            return None
        return MMQuote.parse_obj(result)

    async def send_order(self, http: HttpClient, order: Order, signature: str, permit_transaction: str | None) -> None:
        params = {
            'order': order.dict(),
            'signature': signature,
            'permit_transaction': permit_transaction,
        }
        try:
            await http.post(f'{self._url}/api/v0/order', json=params)
        except HttpClientException as e:
            raise SendOrderException(str(e)) from e
