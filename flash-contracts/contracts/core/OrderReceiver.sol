// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IOrderReceiver} from "../interfaces/IOrderReceiver.sol";
import {Order} from "../interfaces/Order.sol";

import {EnvLib} from "./EnvLib.sol";
import {OrderHashLib} from "./OrderHashLib.sol";
import {SigLib} from "./SigLib.sol";
import {NonceBitmapLib} from "./NonceBitmapLib.sol";
import {CollateralWithdrawHashLib} from "./CollateralWithdrawHashLib.sol";

abstract contract OrderReceiver is IOrderReceiver {
    using SafeERC20 for IERC20;

    mapping(address => uint256) public lockedCollateralAmount; // actor -> amount
    mapping(address => mapping(uint256 => uint256)) public collateralWithdrawPrepareNonce; // actor -> unlock chain -> nonce
    mapping(address => mapping(uint256 => uint256)) private _receivedNonceBitmap; // actor -> flag nonce bitmap

    function receiveOrderAsset(Order calldata order_, bytes32 r_, bytes32 vs_) external {
        require(EnvLib.isActiveDeadline(order_.deadline), "OR: order expired");
        require(EnvLib.isThisChain(order_.fromChain), "OR: invalid receive chain");
        require(msg.sender == order_.toActor, "OR: invalid caller");

        bytes32 orderHash = OrderHashLib.calcOrderHash(order_);
        require(
            NonceBitmapLib.isNonceValid(order_.nonce, _receivedNonceBitmap[msg.sender]),
            "OR: already received for order"
        );

        address signer = SigLib.verifyTypedSig(orderHash, r_, vs_);
        require(signer == order_.fromActor, "OR: invalid from sig");

        uint256 lockedAmount = lockedCollateralAmount[msg.sender] + order_.collateralAmount;
        require(lockedAmount <= order_.collateralUnlocked, "OR: insufficient collateral");
        lockedCollateralAmount[msg.sender] = lockedAmount;

        IERC20(order_.fromToken).safeTransferFrom(order_.fromActor, msg.sender, order_.fromAmount);
        NonceBitmapLib.invalidateNonce(order_.nonce, _receivedNonceBitmap[msg.sender]);
        emit AssetReceive(orderHash);
    }

    function orderAssetReceived(address actor_, uint256 orderNonce_) public view returns (bool) {
        return !NonceBitmapLib.isNonceValid(orderNonce_, _receivedNonceBitmap[actor_]);
    }

    function prepareCollateralWithdraw(uint256 amount_, uint256 unlockChain_) external {
        uint256 lockAmount = lockedCollateralAmount[msg.sender] + amount_;
        lockedCollateralAmount[msg.sender] = lockAmount;

        uint256 nonce = collateralWithdrawPrepareNonce[msg.sender][unlockChain_];
        bytes32 withdrawHash = CollateralWithdrawHashLib.calcWithdrawHash(
            msg.sender,
            EnvLib.thisChain(),
            lockAmount,
            unlockChain_,
            amount_,
            nonce
        );
        collateralWithdrawPrepareNonce[msg.sender][unlockChain_] = nonce + 1;

        emit CollateralWithdrawPrepare(withdrawHash);
    }
}
