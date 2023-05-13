from web3.auto import w3

from .erc20_abi import ERC20_CONTRACT_ABI


ERC20_CONTRACT = w3.eth.contract(abi=ERC20_CONTRACT_ABI)
