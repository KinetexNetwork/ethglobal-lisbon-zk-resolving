// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IOrderSender} from "../interfaces/IOrderSender.sol";
import {Order} from "../interfaces/Order.sol";

import {EnvLib} from "./EnvLib.sol";
import {OrderHashLib} from "./OrderHashLib.sol";

abstract contract OrderSender is IOrderSender {
    using SafeERC20 for IERC20;

    function sendOrderAsset(Order calldata order_) external {
        require(EnvLib.isActiveDeadline(order_.deadline), "OS: order expired");
        require(EnvLib.isThisChain(order_.toChain), "OS: invalid send chain");
        require(msg.sender == order_.toActor, "OS: invalid caller"); // Only actor itself can cause double send

        IERC20(order_.toToken).safeTransferFrom(msg.sender, order_.fromActor, order_.toAmount);
        bytes32 orderHash = OrderHashLib.calcOrderHash(order_);
        emit AssetSend(orderHash);
    }
}
