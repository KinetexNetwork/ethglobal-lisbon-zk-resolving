from web3.auto import w3

from .constants import MAX_APPROVE_VALUE
from .erc20 import ERC20_CONTRACT


def form_approve_data(
    spender: str,
    value: int = MAX_APPROVE_VALUE,
) -> str:
    '''Returns input_data that approves specified contract to use any token'''
    contract_call = ERC20_CONTRACT.encodeABI('approve', [w3.to_checksum_address(spender), value])
    return contract_call
