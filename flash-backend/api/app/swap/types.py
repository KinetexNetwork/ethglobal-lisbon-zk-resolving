ORDER_STRUCT_TYPES = {
    'types': {
        'EIP712Domain': [
            {'name': 'name', 'type': 'string'},
        ],
        'Order': [
            {'name': 'fromActor', 'type': 'address'},
            {'name': 'fromChain', 'type': 'uint256'},
            {'name': 'fromToken', 'type': 'address'},
            {'name': 'fromAmount', 'type': 'uint256'},
            {'name': 'toActor', 'type': 'address'},
            {'name': 'toChain', 'type': 'uint256'},
            {'name': 'toToken', 'type': 'address'},
            {'name': 'toAmount', 'type': 'uint256'},
            {'name': 'collateralChain', 'type': 'uint256'},
            {'name': 'collateralAmount', 'type': 'uint256'},
            {'name': 'collateralUnlocked', 'type': 'uint256'},
            {'name': 'deadline', 'type': 'uint256'},
            {'name': 'nonce', 'type': 'uint256'},
        ],
    },
    'primaryType': 'Order',
}
