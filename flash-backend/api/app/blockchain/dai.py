from web3.auto import w3

from app.utils.constants import NATIVE_TOKEN_ADDRESS
from app.utils.convert import hex_to_int
from app.utils.http.client import HttpClient

from .dai_abi import DAI_CONTRACT_ABI
from .exc import BlockchainException
from .node import ContractCallParams
from .node import Node
from .node import NodeProviderException


DAI_CONTRACT = w3.eth.contract(abi=DAI_CONTRACT_ABI)


def form_nonce_data(
    owner: str,
) -> str:
    contract_call = DAI_CONTRACT.encodeABI(
        'getNonce',
        [
            w3.to_checksum_address(owner),  # _owner, address
        ],
    )
    return contract_call


async def check_dai_nonce(
    http: HttpClient,
    chain_id: str,
    token: str,
    owner: str,
) -> int:
    assert token != NATIVE_TOKEN_ADDRESS
    data = form_nonce_data(owner)
    node = Node(chain_id, http)
    contract_call_params = ContractCallParams(from_address=owner, contract_address=token, data=data, value=None)
    try:
        result = await node.call(contract_call_params)
    except NodeProviderException as e:
        raise BlockchainException(str(e)) from e
    return hex_to_int(result.hex())
