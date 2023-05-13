// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {SafeERC20, IERC20Permit} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {SigLib} from "./SigLib.sol";

interface IDaiPermit {
    function nonces(address holder) external returns (uint256);

    function permit(
        address holder,
        address spender,
        uint256 nonce,
        uint256 expiry,
        bool allowed,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}

struct TokenPermissions {
    address token;
    uint256 amount;
}

struct PermitTransferFrom {
    TokenPermissions permitted;
    uint256 nonce;
    uint256 deadline;
}

struct SignatureTransferDetails {
    address to;
    uint256 requestedAmount;
}

interface Permit2 {
    function permitTransferFrom(
        PermitTransferFrom memory permit,
        SignatureTransferDetails calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external;
}

abstract contract TokenPermitter {
    using SafeERC20 for IERC20Permit;

    address private constant PERMIT2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;

    function permit(
        address from_,
        address token_,
        uint256 amount_,
        uint256 deadline_,
        bytes32 r_,
        bytes32 vs_
    ) external {
        (bytes32 s, uint8 v) = SigLib.unpackSigVs(vs_);
        IERC20Permit(token_).safePermit(from_, address(this), amount_, deadline_, v, r_, s);
    }

    function permitDai(
        address from_,
        address token_,
        bool allowed_,
        uint256 deadline_,
        bytes32 r_,
        bytes32 vs_
    ) external {
        uint256 nonce = IDaiPermit(token_).nonces(from_);
        (bytes32 s, uint8 v) = SigLib.unpackSigVs(vs_);
        IDaiPermit(token_).permit(from_, address(this), nonce, deadline_, allowed_, v, r_, s);
        require(IDaiPermit(token_).nonces(from_) == nonce + 1, "TP: permit did not succeed"); // Like SafeERC20.safePermit
    }

    function permitUniswap(
        address from_,
        address token_,
        uint256 amount_,
        uint256 deadline_,
        bytes calldata signature_
    ) external {
        uint256 nonce = uint256(keccak256(abi.encodePacked(token_, from_, amount_, deadline_, address(this))));
        Permit2(PERMIT2).permitTransferFrom(
            PermitTransferFrom({
                permitted: TokenPermissions({token: token_, amount: amount_}),
                nonce: nonce,
                deadline: deadline_
            }),
            SignatureTransferDetails({to: address(this), requestedAmount: amount_}),
            from_,
            signature_
        );
    }
}
