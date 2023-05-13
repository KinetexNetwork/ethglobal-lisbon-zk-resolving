from typing import Mapping, Optional, Union
from unittest import IsolatedAsyncioTestCase
from aiohttp import ClientSession
from aioredis.connection import ConnectionPool
from app.utils.http.client import HttpClient
from app.swap.swapper import Swapper
from aioredis import Redis
from app.blockchain.node import Node

class ServiceTest(IsolatedAsyncioTestCase):
    async def test_proof(self) -> None:
        async with ClientSession() as client:
            http = HttpClient(client)
            swapper = Swapper(http, Redis(), '100')
            node = Node('100', http)
            receipt = await node.get_transaction_receipt('0xe5cfe667781ffa66dfcf4eb19642fb7d13dc0183908d8c1dcbd256aba8a2a894')

            proof = await swapper.get_send_proof(receipt)
            print(proof)