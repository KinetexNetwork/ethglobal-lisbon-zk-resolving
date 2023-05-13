from web3.auto import w3

from app.utils.convert import hex_to_int
from app.utils.http.client import HttpClient

from .erc20 import ERC20_CONTRACT
from .node import ContractCallParams
from .node import Node


def form_get_balance_data(user_address: str) -> str:
    contract_call = ERC20_CONTRACT.encodeABI(
        'balanceOf',
        [
            w3.to_checksum_address(user_address),
        ],
    )
    return contract_call


async def check_balance(
    http: HttpClient,
    chain_id: str,
    token: str,
    user_address: str,
) -> int:
    data = form_get_balance_data(user_address)
    node = Node(chain_id, http)
    contract_call_params = ContractCallParams(from_address=user_address, contract_address=token, data=data, value=None)
    result = await node.call(contract_call_params)
    return hex_to_int(result.hex())
