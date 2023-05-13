// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {Order} from "../interfaces/Order.sol";

import {OrderHashLib} from "../core/OrderHashLib.sol";
import {SigLib} from "../core/SigLib.sol";

contract OrderSigTest {
    uint256 public lastGasBefore;
    uint256 public lastGasAfterHash;
    uint256 public lastGasAfterSig;
    address public lastSigner;

    function testSignature(Order calldata order_, bytes32 r_, bytes32 vs_) external {
        uint256 gasBefore = gasleft();
        bytes32 orderHash = OrderHashLib.calcOrderHash(order_);
        uint256 gasAfterHash = gasleft();
        address signer = SigLib.verifyTypedSig(orderHash, r_, vs_);
        uint256 gasAfterSig = gasleft();

        lastGasBefore = gasBefore;
        lastGasAfterHash = gasAfterHash;
        lastGasAfterSig = gasAfterSig;
        lastSigner = signer;
    }
}
