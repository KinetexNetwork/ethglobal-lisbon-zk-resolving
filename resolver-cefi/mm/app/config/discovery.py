from typing import NamedTuple

from .domain import Domain


class DiscoveryConfig(NamedTuple):
    host: str
    port: int
    scheme: str
    url: str


def get_discovery_config(domain: Domain) -> DiscoveryConfig:
    discovery_domain = Domain('DISCOVERY', domain)

    host = discovery_domain.env('HOST')
    port = discovery_domain.env_int('PORT')
    scheme = discovery_domain.env('SCHEME')
    url = f'{scheme}://{host}:{port}'

    config = DiscoveryConfig(
        host=host,
        port=port,
        scheme=scheme,
        url=url,
    )
    return config
