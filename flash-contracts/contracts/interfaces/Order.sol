// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

struct Order {
    address fromActor;
    uint256 fromChain;
    address fromToken;
    uint256 fromAmount;
    address toActor;
    uint256 toChain;
    address toToken;
    uint256 toAmount;
    uint256 collateralChain;
    uint256 collateralAmount;
    uint256 collateralUnlocked;
    uint256 deadline;
    uint256 nonce;
}
