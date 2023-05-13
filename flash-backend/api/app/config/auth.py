from typing import NamedTuple

from .domain import Domain


class AuthConfig(NamedTuple):
    key: str


def get_auth_config(domain: Domain) -> AuthConfig:
    auth_domain = Domain('AUTH', domain)

    key = auth_domain.env('KEY')

    config = AuthConfig(
        key=key,
    )
    return config
