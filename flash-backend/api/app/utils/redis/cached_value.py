from datetime import timedelta
from typing import Awaitable
from typing import Callable
from typing import Generic
from typing import Type
from typing import TypeVar

from aioredis import Redis
from pydantic import BaseModel

from .value import RedisValue


T = TypeVar('T', bound=BaseModel)


class RedisCachedValue(Generic[T]):
    def __init__(
        self,
        /,
        redis: Redis,
        model: Type[T],
        key: str,
        load: Callable[[], Awaitable[T]],
        ttl: timedelta | None = timedelta(seconds=10),
        get_ttl_from_model: Callable[[T], timedelta] | None = None,
    ) -> None:
        assert ttl or get_ttl_from_model
        self._value = RedisValue(redis, model, key)
        self._load = load
        self._ttl = ttl
        self._get_ttl_from_model = get_ttl_from_model

    async def get_value(self) -> T:
        value = await self._value.get()
        if value is not None:
            return value

        return await self.update_value()

    async def update_value(self) -> T:
        value = await self._load()
        ttl = self._get_ttl_from_model(value) if self._get_ttl_from_model is not None else self._ttl
        await self._value.set(value, ttl)
        return value

    async def delete_value(self) -> None:
        await self._value.delete()
