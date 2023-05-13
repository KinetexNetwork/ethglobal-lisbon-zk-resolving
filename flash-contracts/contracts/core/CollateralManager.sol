// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IProofVerifier} from "../proof/interfaces/IProofVerifier.sol";

import {ICollateralManager} from "../interfaces/ICollateralManager.sol";
import {Order} from "../interfaces/Order.sol";

import {EnvLib} from "./EnvLib.sol";
import {CollateralWithdrawHashLib} from "./CollateralWithdrawHashLib.sol";
import {OrderHashLib} from "./OrderHashLib.sol";
import {NonceBitmapLib} from "./NonceBitmapLib.sol";

abstract contract CollateralManager is ICollateralManager {
    using SafeERC20 for IERC20;

    bytes32 private constant WITHDRAW_PREPARE_EVENT_SIG = keccak256("CollateralWithdrawPrepare(bytes32)");
    bytes32 private constant SEND_EVENT_SIG = keccak256("AssetSend(bytes32)");
    bytes32 private constant RECEIVE_EVENT_SIG = keccak256("AssetReceive(bytes32)");

    mapping(address => mapping(uint256 => uint256)) public collateralAmount; // actor -> lock chain -> amount
    mapping(address => mapping(uint256 => uint256)) public unlockedCollateralAmount; // actor -> lock chain -> amount
    mapping(address => mapping(uint256 => uint256)) public collateralWithdrawNonce; // actor -> lock chain -> nonce
    mapping(address => mapping(uint256 => uint256)) private _resolvedNonceBitmap; // actor -> flag nonce bitmap

    function collateralToken() public view virtual returns (IERC20);

    function proofVerifier() public view virtual returns (IProofVerifier);

    function depositCollateral(uint256 amount_, uint256 lockChain_) external {
        collateralToken().safeTransferFrom(msg.sender, address(this), amount_);
        collateralAmount[msg.sender][lockChain_] += amount_;
        unlockedCollateralAmount[msg.sender][lockChain_] += amount_;
        emit CollateralDeposit(msg.sender, lockChain_, amount_);
    }

    function withdrawCollateral(
        uint256 amount_,
        uint256 lockChain_,
        uint256 lockAmount_,
        bytes calldata prepareProof_
    ) external {
        uint256 unlockedAmount = unlockedCollateralAmount[msg.sender][lockChain_];
        require(unlockedAmount >= lockAmount_, "CM: insufficient collateral");

        uint256 nonce = collateralWithdrawNonce[msg.sender][lockChain_];
        bytes32 withdrawHash = CollateralWithdrawHashLib.calcWithdrawHash(
            msg.sender,
            lockChain_,
            lockAmount_,
            EnvLib.thisChain(),
            amount_,
            nonce
        );
        proofVerifier().verifyHashEventProof(WITHDRAW_PREPARE_EVENT_SIG, withdrawHash, lockChain_, prepareProof_);
        collateralWithdrawNonce[msg.sender][lockChain_] = nonce + 1;

        collateralAmount[msg.sender][lockChain_] -= amount_;
        collateralToken().safeTransfer(msg.sender, amount_);

        emit CollateralWithdraw(msg.sender, lockChain_, amount_);
    }

    function confirmOrderAssetSend(Order calldata order_, bytes calldata sendProof_) external {
        bytes32 orderHash = _validateOrder(order_);
        proofVerifier().verifyHashEventProof(SEND_EVENT_SIG, orderHash, order_.toChain, sendProof_);
        require(EnvLib.isActiveDeadline(order_.deadline), "CM: confirm exceeded deadline");
        unlockedCollateralAmount[order_.toActor][order_.fromChain] += order_.collateralAmount;
        NonceBitmapLib.invalidateNonce(order_.nonce, _resolvedNonceBitmap[order_.toActor]);
        emit OrderSendConfirm(orderHash);
    }

    function slashOrderCollateral(Order calldata order_, bytes calldata receiveProof_) external {
        bytes32 orderHash = _validateOrder(order_);
        proofVerifier().verifyHashEventProof(RECEIVE_EVENT_SIG, orderHash, order_.fromChain, receiveProof_);
        require(!EnvLib.isActiveDeadline(order_.deadline), "CM: slash not reached");
        collateralAmount[order_.toActor][order_.fromChain] -= order_.collateralAmount;
        collateralToken().safeTransfer(order_.fromActor, order_.collateralAmount);
        NonceBitmapLib.invalidateNonce(order_.nonce, _resolvedNonceBitmap[order_.toActor]);
        emit OrderCollateralSlash(orderHash);
    }

    function orderResolved(address actor_, uint256 orderNonce_) external view returns (bool) {
        return !NonceBitmapLib.isNonceValid(orderNonce_, _resolvedNonceBitmap[actor_]);
    }

    function _validateOrder(Order calldata order_) private view returns (bytes32 orderHash) {
        // We don't require any order signatures here because we validate proof along. Its validity
        // indicates there was a contract call on other chain which validated the signature if needed
        require(EnvLib.isThisChain(order_.collateralChain), "CM: invalid collateral chain");
        orderHash = OrderHashLib.calcOrderHash(order_);
        require(
            NonceBitmapLib.isNonceValid(order_.nonce, _resolvedNonceBitmap[order_.toActor]),
            "CM: order already resolved"
        );
    }
}
