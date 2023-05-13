// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {NonceBitmapLib} from "../core/NonceBitmapLib.sol";

contract NonceBitmapTest {
    uint256 public lastGasUsed;
    mapping(uint256 => uint256) private _nonceBitmap;

    function invalidateNonce(uint256 nonce_) external {
        uint256 gasBefore = gasleft();

        NonceBitmapLib.invalidateNonce(nonce_, _nonceBitmap);

        uint256 gasAfter = gasleft();
        lastGasUsed = gasBefore - gasAfter;
    }

    function ensureNonceValidThenInvalidate(uint256 nonce_) external {
        uint256 gasBefore = gasleft();

        require(NonceBitmapLib.isNonceValid(nonce_, _nonceBitmap), "NT: nonce invalid");
        NonceBitmapLib.invalidateNonce(nonce_, _nonceBitmap);

        uint256 gasAfter = gasleft();
        lastGasUsed = gasBefore - gasAfter;
    }

    function isNonceValid(uint256 nonce_) external view returns (bool) {
        return NonceBitmapLib.isNonceValid(nonce_, _nonceBitmap);
    }
}
