// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import {Order} from "../interfaces/Order.sol";

library OrderHashLib {
    // prettier-ignore
    bytes32 private constant DOMAIN_TYPE_HASH = keccak256(
        "EIP712Domain("
            "string name"
        ")"
    );
    bytes32 private constant DOMAIN_NAME_HASH = keccak256("KinetexFlash");
    bytes32 private constant DOMAIN_SEPARATOR = keccak256(abi.encode(DOMAIN_TYPE_HASH, DOMAIN_NAME_HASH));

    // prettier-ignore
    bytes32 private constant ORDER_TYPE_HASH = keccak256(
        "Order("
            "address fromActor,"
            "uint256 fromChain,"
            "address fromToken,"
            "uint256 fromAmount,"
            "address toActor,"
            "uint256 toChain,"
            "address toToken,"
            "uint256 toAmount,"
            "uint256 collateralChain,"
            "uint256 collateralAmount,"
            "uint256 collateralBounty,"
            "uint256 collateralUnlocked,"
            "uint256 deadline,"
            "uint256 nonce"
        ")"
    );

    function calcOrderHash(Order calldata order_) internal pure returns (bytes32) {
        return ECDSA.toTypedDataHash(DOMAIN_SEPARATOR, keccak256(abi.encode(ORDER_TYPE_HASH, order_)));
    }
}
