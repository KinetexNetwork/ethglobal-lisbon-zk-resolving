import json
from time import time

from eth_abi.packed import encode_packed
from web3.auto import w3

from .constants import PERMIT2_TYPES


def get_deadline() -> int:
    return int(time() + 60 * 60)


PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3'
PERMIT2_CHAINS = ('1', '10', '137', '42161', '56')

PERMIT2_RESOLVER_ABI = '''
[
   {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_token",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "nonce",
        "outputs": [
            {
                "name": "",
                "type": "uint48"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]
'''

PERMIT2_RESOLVER = w3.eth.contract(abi=PERMIT2_RESOLVER_ABI)


def form_nonce_data(
    owner: str,
    token: str,
    spender: str,
) -> str:
    contract_call = PERMIT2_RESOLVER.encodeABI(
        'nonce',
        [
            w3.to_checksum_address(owner),  # _owner, address
            w3.to_checksum_address(token),  # _owner, address
            w3.to_checksum_address(spender),  # _owner, address
        ],
    )
    return contract_call


def count_nonce(token: str, from_: str, amount: int, deadline: int, resolver: str) -> int:
    encoded = encode_packed(
        ['address', 'address', 'uint256', 'uint256', 'address'], [token, from_, amount, deadline, resolver]
    )
    return w3.to_int(w3.solidity_keccak(['bytes'], [encoded]))


def encode_permit2_struct(
    user_address: str,
    token_address: str,
    spender_address: str,
    chain_id: str,
    amount: int,
) -> tuple[str, int]:
    deadline = get_deadline()
    permit = PERMIT2_TYPES.copy()
    nonce = count_nonce(token_address, user_address, amount, deadline, spender_address)
    message = {
        'permitted': {
            'token': w3.to_checksum_address(token_address),
            'amount': str(amount),
        },
        'spender': str(spender_address),
        'deadline': str(deadline),
        'nonce': str(nonce),
    }
    domain = {
        'name': 'Permit2',
        'chainId': int(chain_id),
        'verifyingContract': w3.to_checksum_address(PERMIT2_ADDRESS),
    }
    permit['message'] = message
    permit['domain'] = domain
    return (json.dumps(permit), deadline)
