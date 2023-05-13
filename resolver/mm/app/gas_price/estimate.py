from datetime import timedelta
from decimal import Decimal

from aioredis import Redis
from pydantic import BaseModel

from app.blockchain.node import Node
from app.config import cfg
from app.utils.http.client import HttpClient
from app.utils.redis.cached_value import RedisCachedValue

from .etherscan import EtherscanApiClient


class GasPrice(BaseModel):
    low: int
    avg: int
    high: int


def make_etherscan_api(http: HttpClient, chain_id: str) -> EtherscanApiClient:
    config = cfg.blockchain.scans[chain_id]
    etherscan_api = EtherscanApiClient(
        config.url,
        http,
        config.api_key,
    )
    return etherscan_api


def gwei_to_wei(gwei: Decimal) -> int:
    return int(gwei * 10**9)


def real_gas_price(chain_id: str, gas_price: GasPrice) -> GasPrice:
    '''Sometimes *scans return not accurate gas price. Let's use some overhead'''
    if chain_id in ('250', '137'):
        return GasPrice(
            low=int(gas_price.low * 1.2),
            avg=int(gas_price.avg * 1.5),
            high=int(gas_price.high * 1.2),
        )
    return gas_price


async def gas_price_estimate(http: HttpClient, redis: Redis, chain_id: str) -> GasPrice:
    async def load() -> GasPrice:
        if chain_id in ('1', '137', '250'):
            # etherscan flow
            try:
                etherscan_api = make_etherscan_api(http, chain_id)
                gas = await etherscan_api.get_latest_gas_info()

                gas_price = GasPrice(
                    low=gwei_to_wei(gas.safe_gas_price),
                    avg=gwei_to_wei(gas.propose_gas_price),
                    high=gwei_to_wei(gas.fast_gas_price),
                )
                return real_gas_price(chain_id, gas_price)
            except Exception:  # pylint: disable=broad-exception-caught
                pass
        # node flow
        node = Node(chain_id, http)
        node_gas_price = await node.gas_price()
        return GasPrice(
            low=node_gas_price,
            avg=node_gas_price,
            high=node_gas_price,
        )

    redis_cache = RedisCachedValue(
        redis=redis,
        model=GasPrice,
        key=f'gas-price-{chain_id}',
        load=load,
        ttl=timedelta(minutes=5),
    )
    gas_price = await redis_cache.get_value()
    return gas_price
