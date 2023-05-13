from typing import NamedTuple

from .domain import Domain


class ContractConfig(NamedTuple):
    swapper_addresses: dict[str, str]
    collateral_token_addresses: dict[str, str]


def get_contract_config(domain: Domain) -> ContractConfig:
    contract_domain = Domain('CONTRACT', domain)

    swapper_addresses = contract_domain.env_dict('SWAPPER_ADDRESSES')
    collateral_token_addresses = contract_domain.env_dict('COLLATERAL_TOKEN_ADDRESSES')

    config = ContractConfig(
        swapper_addresses=swapper_addresses,
        collateral_token_addresses=collateral_token_addresses,
    )
    return config
