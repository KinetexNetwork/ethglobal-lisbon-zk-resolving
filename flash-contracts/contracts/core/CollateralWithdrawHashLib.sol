// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

library CollateralWithdrawHashLib {
    function calcWithdrawHash(
        address collateralActor_,
        uint256 lockChain_,
        uint256 lockAmount_,
        uint256 unlockChain_,
        uint256 amount_,
        uint256 nonce_
    ) internal pure returns (bytes32) {
        return keccak256(abi.encode(collateralActor_, lockChain_, lockAmount_, unlockChain_, amount_, nonce_));
    }
}
