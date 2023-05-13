// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {Order} from "./Order.sol";

interface IOrderSenderEvents {
    event AssetSend(bytes32 indexed orderHash);
}

interface IOrderSender is IOrderSenderEvents {
    function sendOrderAsset(Order calldata order) external;
}
