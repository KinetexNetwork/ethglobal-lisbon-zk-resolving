from typing import Any
from uuid import uuid4

from app.config import cfg
from app.utils.http.client import HttpClient
from app.utils.http.client import HttpClientException

from .node import Node


GENESIS_BLOCK_TIME = {'1': 1606795223, '100': 1638993340, '5': 1616508000}

SLOT_DELTA_TIME = {
    '1': 12,
    '100': 5,
    '5': 12,
}

BLOCK_RECEIPTS_METHODS = {
    '100': 'parity_getBlockReceipts',
    '5': 'eth_getBlockReceipts',
    '1': 'eth_getBlockReceipts',
}


def get_slot_by_time(chain_id: str, timestamp: int) -> int:
    # timestamp = int(time.timestamp())
    dif = timestamp - GENESIS_BLOCK_TIME[chain_id]
    slot = dif // SLOT_DELTA_TIME[chain_id]
    return slot


async def get_slot_by_number(http: HttpClient, chain_id: str, slot: int) -> dict[str, Any] | None:
    url = cfg.blockchain.jsonrpc_node_urls[chain_id]
    try:
        return await http.get(f'{url}/eth/v2/beacon/blocks/{slot}')
    except HttpClientException:
        return None


def get_blockhash_number_by_slot(slot: dict[str, Any]) -> str:
    return slot['data']['message']['body']['eth1_data']['blockhash']


async def get_slot_by_block_number(http: HttpClient, chain_id: str, block_number: int) -> dict[str, Any] | None:
    node = Node(chain_id, http)
    block = await node.get_block(block_number)
    timestamp = block['timestamp']
    slot_number = get_slot_by_time(chain_id, timestamp)
    # # we should doublecheck nearest slots
    # if chain_id == '1':
    #     coros = [get_slot_by_number(http, chain_id, slot) for slot in (slot_number - 1, slot_number, slot_number + 1)]
    #     slots = await asyncio.gather(*coros)
    #     actual_slot = next([slot for slot in slots if get_blockhash_number_by_slot(slot) == block['hash']], None)
    # else:
    actual_slot = await get_slot_by_number(http, chain_id, slot_number)
    return actual_slot


async def get_state_by_slot(http: HttpClient, chain_id: str, slot: int) -> str | None:
    url = cfg.blockchain.jsonrpc_node_urls[chain_id]
    try:
        return await http.get_text(f'{url}/eth/v2/debug/beacon/states/{slot}')
    except HttpClientException:
        return None


async def get_receipts_by_block(http: HttpClient, chain_id: str, block: int) -> list[dict[str, Any]] | None:
    url = cfg.blockchain.jsonrpc_node_urls[chain_id]
    try:
        result = await http.post(
            url,
            json={
                "id": str(uuid4()),
                "jsonrpc": "2.0",
                "method": BLOCK_RECEIPTS_METHODS[chain_id],
                "params": [hex(block)],
            },
        )
        return result['result']
    except HttpClientException:
        return None
