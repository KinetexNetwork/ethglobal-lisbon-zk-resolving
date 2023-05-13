from typing import NamedTuple

from .domain import Domain


class ContractConfig(NamedTuple):
    swapper_addresses: dict[str, str]
    collateral_chain: str


def get_contract_config(domain: Domain) -> ContractConfig:
    contract_domain = Domain('CONTRACT', domain)

    swapper_addresses = contract_domain.env_dict('SWAPPER_ADDRESSES')
    collateral_chain = contract_domain.env('COLLATERAL_CHAIN')

    config = ContractConfig(
        swapper_addresses=swapper_addresses,
        collateral_chain=collateral_chain,
    )
    return config
