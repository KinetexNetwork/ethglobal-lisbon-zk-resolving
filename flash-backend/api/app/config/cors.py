from typing import NamedTuple

from .domain import Domain


class CorsConfig(NamedTuple):
    origins: list[str]


def get_cors_config(domain: Domain) -> CorsConfig:
    cors_domain = Domain('CORS', domain)

    origins = cors_domain.env_list('ORIGINS')

    config = CorsConfig(
        origins=origins,
    )
    return config
