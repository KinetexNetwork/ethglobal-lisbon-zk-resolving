from typing import NamedTuple

from .auth import AuthConfig
from .auth import get_auth_config
from .blockchain import BlockchainConfig
from .blockchain import get_blockchain_config
from .contract import ContractConfig
from .contract import get_contract_config
from .cors import CorsConfig
from .cors import get_cors_config
from .domain import Domain
from .redis import RedisConfig
from .redis import get_redis_config
from .spec import SpecConfig
from .spec import get_spec_config


class Config(NamedTuple):
    redis: RedisConfig
    auth: AuthConfig
    cors: CorsConfig
    spec: SpecConfig
    contract: ContractConfig
    blockchain: BlockchainConfig

    # temp config with single mm
    mm_url: str
    mm_address: str


def _load_cfg() -> Config:
    domain = Domain('API')
    redis = get_redis_config(domain)
    auth = get_auth_config(domain)
    cors = get_cors_config(domain)
    spec = get_spec_config(domain)
    contract = get_contract_config(domain)
    blockchain = get_blockchain_config(domain)

    # temp config when mm is a service
    mm_url = domain.env('MM_URL')
    mm_address = domain.env('MM_ADDRESS')

    config = Config(
        redis=redis,
        auth=auth,
        cors=cors,
        spec=spec,
        contract=contract,
        blockchain=blockchain,
        mm_url=mm_url,
        mm_address=mm_address,
    )
    return config


cfg = _load_cfg()
