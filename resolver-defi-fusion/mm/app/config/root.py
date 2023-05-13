from typing import NamedTuple

from .auth import AuthConfig
from .auth import get_auth_config
from .blockchain import BlockchainConfig
from .blockchain import get_blockchain_config
from .contract import ContractConfig
from .contract import get_contract_config
from .discovery import DiscoveryConfig
from .discovery import get_discovery_config
from .domain import Domain
from .maker import MakerConfig
from .maker import get_maker_config
from .redis import RedisConfig
from .redis import get_redis_config


class Config(NamedTuple):
    redis: RedisConfig
    contract: ContractConfig
    maker: MakerConfig
    blockchain: BlockchainConfig

    backend_auth: AuthConfig  # temp config
    backend_url: str  # temp config
    proof: DiscoveryConfig  # temp config


def _load_cfg() -> Config:
    domain = Domain('MM')
    redis = get_redis_config(domain)
    maker = get_maker_config(domain)
    contract = get_contract_config(domain)
    blockchain = get_blockchain_config(domain)

    back = Domain('BACKEND')
    backend_auth = get_auth_config(back)
    backend_url = back.env('URL')
    proof = get_discovery_config(Domain('PROOF'))

    config = Config(
        redis=redis,
        maker=maker,
        contract=contract,
        blockchain=blockchain,
        backend_auth=backend_auth,
        backend_url=backend_url,
        proof=proof,
    )
    return config


cfg = _load_cfg()
