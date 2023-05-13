from typing import NamedTuple

from .domain import Domain


ChainId = str


class BlockchainConfig(NamedTuple):
    supported_chains: list[ChainId]
    jsonrpc_node_urls: dict[ChainId, str]


def get_blockchain_config(domain: Domain) -> BlockchainConfig:
    supported_chains = domain.env_list('SUPPORTED_CHAINS')
    jsonrpc_node_urls = {chain_id: domain.env(f'JSONRPC_NODE_URL_{chain_id}') for chain_id in supported_chains}

    config = BlockchainConfig(
        supported_chains=supported_chains,
        jsonrpc_node_urls=jsonrpc_node_urls,
    )
    return config
