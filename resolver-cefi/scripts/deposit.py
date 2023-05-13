
import os
from web3 import Web3
from web3.auto import w3
import json
from abi import ABI
import time

ADDRESS = os.environ['ADDRESS']
PRIVATE_KEY = os.environ['PRIVATE_KEY']

contract = w3.eth.contract(abi=ABI)
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


def form_deposit_txs() -> list[str]:
    txs = [
        contract.encodeABI(
            'depositCollateral',
            [
                int(amount),
                int(chain),
            ]
        )
        for chain, amount in config['collateral']['amounts'].items()
    ]
    return txs


def deposit() -> None:
    print('Depositing token for collateral')
    txs = form_deposit_txs()
    collateral_chain = config['collateral']['chain']
    contract_address = config['contracts'][collateral_chain]
    for tx in txs:
        send_tx(collateral_chain, tx, contract_address)
        time.sleep(5)


def form_approve_tx(contract_address: str) -> str:
    return erc20.encodeABI(
        'approve',
        [
            contract_address, 
            MAX_UINT256_VALUE,
        ]
    )

def approve() -> None:
    print('Approving token for collateral')
    collateral_chain = config['collateral']['chain']
    contract_address = config['contracts'][collateral_chain]
    tx = form_approve_tx(contract_address)
    send_tx(collateral_chain, tx, config['collateral']['token'])


# Exec
# approve()
# time.sleep(5)
deposit()