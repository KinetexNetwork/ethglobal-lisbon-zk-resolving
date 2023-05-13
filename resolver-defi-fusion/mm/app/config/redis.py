from typing import NamedTuple

from .domain import Domain


class RedisConfig(NamedTuple):
    host: str
    port: int
    url: str


def get_redis_config(domain: Domain) -> RedisConfig:
    redis_domain = Domain('REDIS', domain)

    host = redis_domain.env('HOST')
    port = redis_domain.env_int('PORT')
    url = f'redis://{host}:{port}'

    config = RedisConfig(
        host=host,
        port=port,
        url=url,
    )
    return config
