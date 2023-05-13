// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {Order} from "../interfaces/Order.sol";

library SigLib {
    bytes32 private constant S_MASK = 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
    bytes32 private constant MAX_S = 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0;

    function unpackSigVs(bytes32 vs_) internal pure returns (bytes32 s, uint8 v) {
        s = vs_ & S_MASK;
        v = uint8((uint256(vs_) >> 255) + 27);
    }

    function verifyTypedSig(bytes32 hash_, bytes32 r_, bytes32 vs_) internal pure returns (address) {
        // Based on OpenZeppelin's ECDSA library - optimized to handle compact signatures only
        (bytes32 s, uint8 v) = unpackSigVs(vs_);
        require(s <= MAX_S, "SL: invalid sig s");
        address signer = ecrecover(hash_, v, r_, s);
        require(signer != address(0), "SL: invalid sig");
        return signer;
    }
}
