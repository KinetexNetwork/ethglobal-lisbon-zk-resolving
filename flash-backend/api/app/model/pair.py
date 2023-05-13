from typing import NamedTuple


class Token(NamedTuple):
    address: str
    chain_id: str


class TokenPair(NamedTuple):
    from_token: Token
    to_token: Token
