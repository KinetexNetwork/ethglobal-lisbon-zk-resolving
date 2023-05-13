from contextlib import asynccontextmanager
from typing import AsyncContextManager
from typing import AsyncGenerator
from typing import Callable
from typing import NamedTuple

from aioredis import BlockingConnectionPool
from aioredis import Redis

from app.config.redis import RedisConfig
from app.utils.lifecycle import GlobalObject


RedisContextManager = AsyncContextManager[Redis]
RedisGenerator = AsyncGenerator[Redis, None]

RedisContext = Callable[[], RedisContextManager]
RedisGetter = Callable[[], RedisGenerator]


class RedisBundle(NamedTuple):
    global_redis: GlobalObject[Redis]
    redis_ctx: RedisContext
    get_redis: RedisGetter


async def _redis_constructor(
    redis_config: RedisConfig,
) -> Redis:
    connection_pool = BlockingConnectionPool.from_url(
        redis_config.url,
        decode_responses=True,
        max_connections=500,
        timeout=90,
    )
    redis = Redis(connection_pool=connection_pool)
    await redis.initialize()
    return redis


async def _redis_destructor(
    redis: Redis,
) -> None:
    await redis.close()


def create_redis(redis_config: RedisConfig) -> RedisBundle:
    global_redis: GlobalObject[Redis] = GlobalObject(
        'Redis',
        _redis_constructor,
        _redis_destructor,
        constructor_arg=redis_config,
    )

    @asynccontextmanager
    async def redis_ctx() -> RedisGenerator:
        async with global_redis.object.client() as redis_conn:
            yield redis_conn

    async def get_redis() -> RedisGenerator:
        async with redis_ctx() as redis_conn:
            yield redis_conn

    bundle = RedisBundle(
        global_redis=global_redis,
        redis_ctx=redis_ctx,
        get_redis=get_redis,
    )
    return bundle
