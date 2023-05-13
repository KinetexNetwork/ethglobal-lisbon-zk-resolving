from typing import NamedTuple

from .domain import Domain


class Token(NamedTuple):
    symbol: str
    chain_id: str


class Pair(NamedTuple):
    from_token: Token
    to_token: Token


class PairsConfig(NamedTuple):
    pairs: list[Pair]


def _get_pair(pair_str: str) -> Pair:
    from_token_str, to_token_str = pair_str.split('->')
    from_chain_id, from_symbol = from_token_str.split('-')
    to_chain_id, to_symbol = to_token_str.split('-')
    return Pair(
        from_token=Token(symbol=from_symbol, chain_id=from_chain_id),
        to_token=Token(symbol=to_symbol, chain_id=to_chain_id),
    )


def get_pairs_config(domain: Domain) -> PairsConfig:
    pair_strs = domain.env_list('PAIRS')
    pairs = [_get_pair(p) for p in pair_strs]

    config = PairsConfig(
        pairs=pairs,
    )
    return config
