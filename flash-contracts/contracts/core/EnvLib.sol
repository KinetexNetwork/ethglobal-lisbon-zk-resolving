// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

library EnvLib {
    function timeNow() internal view returns (uint256) {
        return block.timestamp; // solhint-disable not-rely-on-time
    }

    function isActiveDeadline(uint256 deadline_) internal view returns (bool) {
        return deadline_ >= timeNow();
    }

    function thisChain() internal view returns (uint256) {
        return block.chainid;
    }

    function isThisChain(uint256 chain_) internal view returns (bool) {
        return chain_ == thisChain();
    }
}
