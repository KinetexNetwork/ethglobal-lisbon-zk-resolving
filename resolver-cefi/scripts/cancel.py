
import os
from web3 import Web3
from web3.auto import w3
import json

ADDRESS = os.environ['ADDRESS']
PRIVATE_KEY = os.environ['PRIVATE_KEY']


with open('config.json', 'r') as f:
    data = f.read()
    config = json.loads(data)


def send_tx(chain_id: str,) -> None:
    web3 = Web3(Web3.HTTPProvider(config['nodes'][chain_id]))
    nonce = web3.eth.get_transaction_count(ADDRESS)
    tx = {
        "nonce": nonce,
        "to": web3.to_checksum_address('0x0000000000000000000000000000000000000000'),
        "value": 0,
        "gas": 800_000,
        "chainId": int(chain_id),
        "gasPrice": web3.to_wei(config['gas_prices'][chain_id], "gwei"),
        "data": '0x',
    }

    signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)

    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    print('TX send', tx_hash.hex(), chain_id)


send_tx('250')