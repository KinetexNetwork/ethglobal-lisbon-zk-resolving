// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {Order} from "./Order.sol";

interface IOrderReceiverEvents {
    event AssetReceive(bytes32 indexed orderHash);
    event CollateralWithdrawPrepare(bytes32 indexed withdrawHash);
}

interface IOrderReceiverViews {
    function lockedCollateralAmount(address actor) external view returns (uint256);

    function collateralWithdrawPrepareNonce(address actor, uint256 unlockChain) external view returns (uint256);

    function orderAssetReceived(address actor, uint256 orderNonce) external view returns (bool);
}

interface IOrderReceiver is IOrderReceiverEvents, IOrderReceiverViews {
    function receiveOrderAsset(Order calldata order, bytes32 r, bytes32 vs) external;

    function prepareCollateralWithdraw(uint256 amount, uint256 unlockChain) external;
}
