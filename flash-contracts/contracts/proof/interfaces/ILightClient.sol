// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

interface ILightClient {
    function consistent() external view returns (bool);

    function headers(uint256 slot) external view returns (bytes32);

    function timestamps(uint256 slot) external view returns (uint256);
}
