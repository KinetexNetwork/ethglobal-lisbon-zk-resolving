from web3.auto import w3

from app.utils.constants import MAX_UINT256_VALUE
from app.utils.constants import NATIVE_TOKEN_ADDRESS
from app.utils.convert import hex_to_int
from app.utils.http.client import HttpClient

from .erc20 import ERC20_CONTRACT
from .node import ContractCallParams
from .node import Node


def form_get_allowance_data(
    owner: str,
    spender: str,
) -> str:
    contract_call = ERC20_CONTRACT.encodeABI(
        'allowance',
        [
            w3.to_checksum_address(owner),  # _owner, address
            w3.to_checksum_address(spender),  # _spender, address
        ],
    )
    return contract_call


async def check_allowance(
    http: HttpClient,
    chain_id: str,
    token: str,
    owner: str,
    spender: str,
) -> int:
    if token == NATIVE_TOKEN_ADDRESS:
        return MAX_UINT256_VALUE
    data = form_get_allowance_data(owner, spender)
    node = Node(chain_id, http)
    contract_call_params = ContractCallParams(from_address=owner, contract_address=token, data=data, value=None)
    result = await node.call(contract_call_params)
    return hex_to_int(result.hex())
