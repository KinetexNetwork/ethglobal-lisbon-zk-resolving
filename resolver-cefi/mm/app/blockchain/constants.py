MAX_APPROVE_VALUE = 2**256 - 1

MAX_PERMIT_VALUE = 2**256 - 1
MAX_PERMIT2_VALUE = 2**160 - 1

MAX_PERMIT_DEADLINE = 2**256 - 1


PERMIT_TYPES = {
    'types': {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
            {'name': 'version', 'type': 'string'},
            {'name': 'chainId', 'type': 'uint256'},
            {'name': 'verifyingContract', 'type': 'address'},
        ],
        'Permit': [
            {'name': "owner", 'type': "address"},
            {'name': "spender", 'type': "address"},
            {'name': "value", 'type': "uint256"},
            {'name': "nonce", 'type': "uint256"},
            {'name': "deadline", 'type': "uint256"},
        ],
    },
    'primaryType': 'Permit',
}


PERMIT_CHAIN_VIA_SALT_TYPES = {
    'types': {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
            {'name': 'version', 'type': 'string'},
            {'name': 'verifyingContract', 'type': 'address'},
            {'name': 'salt', 'type': 'bytes32'},
        ],
        'Permit': [
            {'name': "owner", 'type': "address"},
            {'name': "spender", 'type': "address"},
            {'name': "value", 'type': "uint256"},
            {'name': "nonce", 'type': "uint256"},
            {'name': "deadline", 'type': "uint256"},
        ],
    },
    'primaryType': 'Permit',
}


PERMIT_DAI_TYPES = {
    'types': {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
            {'name': 'version', 'type': 'string'},
            {'name': 'chainId', 'type': 'uint256'},
            {'name': 'verifyingContract', 'type': 'address'},
        ],
        'Permit': [
            {'name': "holder", 'type': "address"},
            {'name': "spender", 'type': "address"},
            {'name': "allowed", 'type': "bool"},
            {'name': "nonce", 'type': "uint256"},
            {'name': "expiry", 'type': "uint256"},
        ],
    },
    'primaryType': 'Permit',
}


PERMIT2_TYPES = {
    'types': {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
            {'name': 'version', 'type': 'string'},
            {'name': 'chainId', 'type': 'uint256'},
            {'name': 'verifyingContract', 'type': 'address'},
        ],
        'TokenPermissions': [
            {'name': 'token', 'type': 'address'},
            {'name': 'amount', 'type': 'uint256'},
        ],
        'PermitTransferFrom': [
            {'name': "permitted", 'type': "TokenPermissions"},
            {'name': "spender", 'type': "address"},
            {'name': 'nonce', 'type': 'uint256'},
            {'name': 'deadline', 'type': 'uint256'},
        ],
    },
    'primaryType': 'PermitTransferFrom',
}
