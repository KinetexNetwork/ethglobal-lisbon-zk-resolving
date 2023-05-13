// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";

import {OrderReceiver} from "./core/OrderReceiver.sol";
import {OrderSender} from "./core/OrderSender.sol";
import {TokenPermitter} from "./core/TokenPermitter.sol";

import {IKinetexFlashLight} from "./interfaces/IKinetexFlashLight.sol";

contract KinetexFlashLight is IKinetexFlashLight, OrderReceiver, OrderSender, TokenPermitter, Multicall {}
