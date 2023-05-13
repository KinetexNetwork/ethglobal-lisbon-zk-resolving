// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {IOrderReceiver} from "./IOrderReceiver.sol";
import {IOrderSender} from "./IOrderSender.sol";
import {ICollateralManager} from "./ICollateralManager.sol";

// prettier-ignore
// solhint-disable-next-line no-empty-blocks
interface IKinetexFlash is IOrderReceiver, IOrderSender, ICollateralManager {}
