from typing import NamedTuple

from .domain import Domain


class SpecConfig(NamedTuple):
    show_special: bool


def get_spec_config(domain: Domain) -> SpecConfig:
    spec_domain = Domain('SPEC', domain)

    show_special = spec_domain.env_bool('SHOW_SPECIAL')

    config = SpecConfig(
        show_special=show_special,
    )
    return config
