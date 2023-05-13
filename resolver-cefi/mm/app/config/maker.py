from typing import NamedTuple

from .domain import Domain


class MakerConfig(NamedTuple):
    address: str
    private_key: str


def get_maker_config(domain: Domain) -> MakerConfig:
    maker_domain = Domain('MAKER', domain)
    address = maker_domain.env('ADDRESS')
    pk = maker_domain.env('PRIVATE_KEY')

    config = MakerConfig(
        address=address,
        private_key=pk,
    )
    return config
