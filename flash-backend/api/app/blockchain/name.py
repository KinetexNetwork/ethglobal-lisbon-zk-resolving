from web3.auto import w3

from app.utils.constants import NATIVE_TOKEN_ADDRESS
from app.utils.http.client import HttpClient

from .erc20 import ERC20_CONTRACT
from .node import ContractCallParams
from .node import Node


def form_name_data() -> str:
    contract_call = ERC20_CONTRACT.encodeABI(
        'name',
    )
    return contract_call


async def get_name(
    http: HttpClient,
    chain_id: str,
    token: str,
) -> int:
    assert token != NATIVE_TOKEN_ADDRESS
    data = form_name_data()

    node = Node(chain_id, http)
    contract_call_params = ContractCallParams(from_address=None, contract_address=token, data=data, value=None)
    result = await node.call(contract_call_params)
    return w3.eth.codec.decode(('string',), result)[0]
