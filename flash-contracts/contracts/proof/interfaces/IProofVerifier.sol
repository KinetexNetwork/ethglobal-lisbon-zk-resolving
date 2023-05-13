// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

interface IProofVerifier {
    function verifyHashEventProof(bytes32 sig, bytes32 hash, uint256 chain, bytes calldata proof) external view;
}
