
import os
from web3 import Web3
from web3.auto import w3
import json

ADDRESS = os.environ['ADDRESS']
PRIVATE_KEY = os.environ['PRIVATE_KEY']

MAX_UINT256_VALUE = 2**256 - 1

erc20_abi = '''
[ 
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
'''
erc20 = w3.eth.contract(abi = erc20_abi)


with open('config.json', 'r') as f:
    data = f.read()
    config = json.loads(data)


def send_tx(chain_id: str, input_data: str, contract_address: str) -> None:
    web3 = Web3(Web3.HTTPProvider(config['nodes'][chain_id]))
    nonce = web3.eth.get_transaction_count(ADDRESS)
    tx = {
        "nonce": nonce,
        "to": web3.to_checksum_address(contract_address),
        "value": 0,
        "gas": 800_000,
        "chainId": int(chain_id),
        "gasPrice": web3.to_wei(config['gas_prices'][chain_id], "gwei"),
        "data": input_data,
    }

    signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)

    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    print('TX send', tx_hash.hex(), chain_id)


def approve() -> None:
    print('Approving tokens for trading')
    for chain, token in config['trading_tokens'].items():
        data = erc20.encodeABI(
            'approve',
            [
                config['contracts'][chain], 
                MAX_UINT256_VALUE,
            ]
        )
        send_tx(chain, data, token)


# Exec
approve()