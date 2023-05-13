// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {KinetexFlash} from "../KinetexFlash.sol";

import {ProofVerifierMock} from "./ProofVerifierMock.sol";

contract KinetexFlashTest is KinetexFlash {
    // prettier-ignore
    constructor(address collateralToken_)
        KinetexFlash(collateralToken_, address(new ProofVerifierMock()))
    {} // solhint-disable no-empty-blocks

    function setLockedCollateralAmount(address actor_, uint256 amount_) external {
        lockedCollateralAmount[actor_] = amount_;
    }
}
