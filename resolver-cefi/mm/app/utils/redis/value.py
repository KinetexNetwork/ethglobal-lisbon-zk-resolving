from datetime import timedelta
from typing import Generic
from typing import Type
from typing import TypeVar

from aioredis import Redis
from pydantic import BaseModel


T = TypeVar('T', bound=BaseModel)


class RedisValue(Generic[T]):
    def __init__(
        self,
        /,
        redis: Redis,
        model: Type[T],
        key: str,
    ) -> None:
        self._redis = redis
        self._model = model
        self._key = key

    async def get(self) -> T | None:
        value_json = await self._redis.get(self._key)
        if value_json is None:
            return None

        value = self._model.parse_raw(value_json)
        return value

    async def set(
        self,
        value: T,
        ttl: timedelta | None = None,
    ) -> None:
        value_json = value.json()
        await self._redis.set(self._key, value_json, ex=ttl)

    async def delete(self) -> None:
        await self._redis.delete(self._key)
