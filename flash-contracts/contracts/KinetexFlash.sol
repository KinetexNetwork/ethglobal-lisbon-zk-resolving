// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IProofVerifier} from "./proof/interfaces/IProofVerifier.sol";

import {OrderReceiver} from "./core/OrderReceiver.sol";
import {OrderSender} from "./core/OrderSender.sol";
import {CollateralManager} from "./core/CollateralManager.sol";
import {TokenPermitter} from "./core/TokenPermitter.sol";

import {IKinetexFlash} from "./interfaces/IKinetexFlash.sol";

contract KinetexFlash is IKinetexFlash, OrderReceiver, OrderSender, CollateralManager, TokenPermitter, Multicall {
    address private immutable _collateralToken;
    address private immutable _proofVerifier;

    constructor(address collateralToken_, address proofVerifier_) {
        _collateralToken = collateralToken_;
        _proofVerifier = proofVerifier_;
    }

    function collateralToken() public view override returns (IERC20) {
        return IERC20(_collateralToken);
    }

    function proofVerifier() public view override returns (IProofVerifier) {
        return IProofVerifier(_proofVerifier);
    }
}
