// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PermitTokenMock is ERC20Permit {
    // prettier-ignore
    constructor()
        ERC20("Test Token", "ttkn")
        ERC20Permit("Test Token Domain")
    {} // solhint-disable no-empty-blocks

    function mint(address account_, uint256 amount_) external {
        _mint(account_, amount_);
    }
}
