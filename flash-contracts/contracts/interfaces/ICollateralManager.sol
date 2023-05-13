// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {Order} from "./Order.sol";

interface ICollateralManagerEvents {
    event CollateralDeposit(address actor, uint256 lockChain, uint256 amount);
    event CollateralWithdraw(address actor, uint256 lockChain, uint256 amount);
    event OrderSendConfirm(bytes32 orderHash);
    event OrderCollateralSlash(bytes32 orderHash);
}

interface ICollateralManagerViews {
    function collateralAmount(address actor, uint256 lockChain) external view returns (uint256);

    function unlockedCollateralAmount(address actor, uint256 lockChain) external view returns (uint256);

    function collateralWithdrawNonce(address actor, uint256 lockChain) external view returns (uint256);

    function orderResolved(address actor, uint256 orderNonce) external view returns (bool);
}

interface ICollateralManager is ICollateralManagerEvents, ICollateralManagerViews {
    function depositCollateral(uint256 amount, uint256 lockChain) external;

    function withdrawCollateral(
        uint256 amount,
        uint256 lockChain,
        uint256 lockAmount,
        bytes calldata prepareProof
    ) external;

    function confirmOrderAssetSend(Order calldata order, bytes calldata sendProof) external;

    function slashOrderCollateral(Order calldata order, bytes calldata receiveProof) external;
}
