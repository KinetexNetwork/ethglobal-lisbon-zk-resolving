from typing import NamedTuple

from .domain import Domain


ChainId = str


class ScanConfig(NamedTuple):
    url: str
    api_key: str


class BlockchainConfig(NamedTuple):
    supported_chains: list[ChainId]
    jsonrpc_node_urls: dict[ChainId, str]
    scans: dict[ChainId, ScanConfig]


def _get_scan(domain: Domain, chain_id: ChainId) -> ScanConfig:
    url = domain.env(f'URL_{chain_id}')
    api_key = domain.env(f'API_KEY_{chain_id}')
    return ScanConfig(
        url=url,
        api_key=api_key,
    )


def get_blockchain_config(domain: Domain) -> BlockchainConfig:
    supported_chains = domain.env_list('SUPPORTED_CHAINS')
    jsonrpc_node_urls = {chain_id: domain.env(f'JSONRPC_NODE_URL_{chain_id}') for chain_id in supported_chains}
    scan_domain = Domain('SCAN', domain)
    scans = {chain_id: _get_scan(scan_domain, chain_id) for chain_id in supported_chains}
    config = BlockchainConfig(
        supported_chains=supported_chains,
        jsonrpc_node_urls=jsonrpc_node_urls,
        scans=scans,
    )
    return config
