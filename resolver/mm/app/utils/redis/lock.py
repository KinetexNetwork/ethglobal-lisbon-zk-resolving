import asyncio
from contextlib import asynccontextmanager
from typing import AsyncContextManager
from typing import AsyncGenerator
from uuid import uuid4

from aiohttp.abc import AbstractView
from aioredis import Redis
from aioredis.exceptions import LockNotOwnedError
from aioredis.lock import Lock


DEFAULT_LOCK_TIMEOUT = 15
DEFAULT_ACQUIRE_DELAY = 0.1


class RedisLockException(Exception):
    pass


async def _acquire(lock: Lock, delay: float) -> bytes:
    token = uuid4().bytes
    while True:
        if await lock.acquire(blocking=False, token=token):
            return token
        await asyncio.sleep(delay)


async def _release(lock: Lock) -> None:
    try:
        await lock.release()
    except LockNotOwnedError as e:
        # Lock is not owned anymore, meaning operation has exceeded dedicated timeout and probably there is a new
        # executor performing similar one. So we do not want to commit any database changes from this API call.
        # Therefore internal server error is provoked by unhandled exception below.
        raise RedisLockException from e


class RedisLock:
    def __init__(self, lock: Lock, timeout: float, name: str, token: bytes):
        self._lock = lock
        self._timeout = timeout
        self._name = name
        self._token = token

    @property
    def name(self) -> str:
        return self._name

    @property
    def token(self) -> bytes:
        return self._token

    async def reset_timeout(self) -> None:
        try:
            await self._lock.extend(self._timeout, replace_ttl=True)
        except LockNotOwnedError as e:
            raise RedisLockException from e


@asynccontextmanager
async def redis_lock(
    redis: Redis,
    name: str,
    timeout: float = DEFAULT_LOCK_TIMEOUT,
    acquire_delay: float = DEFAULT_ACQUIRE_DELAY,
) -> AsyncGenerator[RedisLock, None]:
    lock: Lock = redis.lock(name, timeout=timeout)
    token = await _acquire(lock, acquire_delay)
    try:
        yield RedisLock(lock, timeout, name, token)
    finally:
        await _release(lock)


class RedisLockMixin(AbstractView):
    def redis_lock(
        self,
        name: str,
        timeout: float = DEFAULT_LOCK_TIMEOUT,
        acquire_delay: float = DEFAULT_ACQUIRE_DELAY,
    ) -> AsyncContextManager[RedisLock]:
        redis: Redis = self.request['redis']
        return redis_lock(redis, name, timeout, acquire_delay)
