from typing import Any
from typing import NamedTuple
from typing import cast

from web3 import Web3
from web3.auto import w3
from web3.eth import AsyncEth
from web3.exceptions import TransactionNotFound
from web3.middleware import async_geth_poa_middleware
from web3.providers import BaseProvider

from app.config import cfg
from app.utils.http.client import HttpClient


class ContractCallParams(NamedTuple):
    from_address: str | None
    contract_address: str
    data: str
    value: int | None


class NodeProviderException(Exception):
    pass


class Node:
    def __init__(self, chain_id: str, http: HttpClient) -> None:
        self._base_url = cfg.blockchain.jsonrpc_node_urls[chain_id]
        self._http = http

    async def _make_w3(self) -> Web3:
        modules = {
            'eth': (AsyncEth,),
        }
        provider = cast(BaseProvider, Web3.AsyncHTTPProvider(self._base_url))

        w3 = Web3(
            provider,
            modules=modules,  # type: ignore
            middlewares=[async_geth_poa_middleware],
        )
        await w3.provider.cache_async_session(self._http._client)  # type: ignore  # pylint: disable=protected-access
        return w3

    async def call(self, params: ContractCallParams) -> bytes | bytearray:
        web3 = await self._make_w3()
        dict_params = {
            'to': w3.to_checksum_address(params.contract_address),
            'data': params.data,
        }
        return await web3.eth.call(dict_params, 'latest')  # type: ignore

    async def estimate_gas(self, params: ContractCallParams) -> int:
        assert params.from_address
        dict_params = {
            'from': w3.to_checksum_address(params.from_address),
            'to': w3.to_checksum_address(params.contract_address),
            'data': params.data,
            'value': params.value or 0,
        }
        web3 = await self._make_w3()
        try:
            gas = await web3.eth.estimate_gas(dict_params, 'latest')  # type: ignore
        except ValueError as e:
            raise NodeProviderException('Failed to estimate gas') from e
        if not gas:
            raise NodeProviderException('Node returned 0 gas')
        return gas

    async def get_block_number(self) -> int:
        web3 = await self._make_w3()
        return await web3.eth.get_block_number()  # type: ignore

    async def get_balance(self, address: str, block_number: int | None = None) -> int:
        web3 = await self._make_w3()
        return await web3.eth.get_balance(w3.to_checksum_address(address), block_number)  # type: ignore

    async def get_transaction_receipt(self, txid: str) -> dict[str, Any]:
        web3 = await self._make_w3()
        return await web3.eth.get_transaction_receipt(txid)  # type: ignore

    async def get_logs(
        self,
        from_block_number: int,
        contract_address: str,
        to_block_number: int | None = None,
    ) -> list[dict[str, Any]]:
        params = {
            'address': w3.to_checksum_address(contract_address),
            'fromBlock': from_block_number,
        }
        if to_block_number:
            params['toBlock'] = to_block_number
        web3 = await self._make_w3()
        return await web3.eth.get_logs(params)  # type: ignore

    async def get_block_transactions(
        self,
        block_number: int,
    ) -> list[dict[str, Any]]:
        web3 = await self._make_w3()
        block = await web3.eth.get_block(block_number, True)  # type: ignore
        return block['transactions']

    async def get_block(
        self,
        block_number: int,
    ) -> dict[str, Any]:
        web3 = await self._make_w3()
        block = await web3.eth.get_block(block_number, True)  # type: ignore
        return block

    async def send_raw_transaction(
        self,
        transaction: bytes,
    ) -> str:
        web3 = await self._make_w3()
        tx_hash = await web3.eth.send_raw_transaction(transaction)  # type: ignore
        return tx_hash.hex()

    async def get_transaction_count(
        self,
        address: str,
    ) -> int:
        web3 = await self._make_w3()
        count = await web3.eth.get_transaction_count(address)  # type: ignore
        return count

    async def gas_price(self) -> int:
        web3 = await self._make_w3()
        gas_price = await web3.eth.gas_price  # type: ignore
        return gas_price

    async def get_transaction(self, txid: str) -> dict[str, Any]:
        web3 = await self._make_w3()
        try:
            return await web3.eth.get_transaction(txid)  # type: ignore
        except TransactionNotFound as e:
            raise NodeProviderException('Tx not found') from e

    async def max_priority_fee(self) -> int:
        web3 = await self._make_w3()
        return await web3.eth.max_priority_fee  # type: ignore
