// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.18;

import {IProofVerifier} from "../proof/interfaces/IProofVerifier.sol";

contract ProofVerifierMock is IProofVerifier {
    function verifyHashEventProof(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) external pure {
        require(proof_.length == 96, "PM: invalid proof length");
        require(bytes32(proof_[0:32]) == sig_, "PM: invalid proof sig");
        require(bytes32(proof_[32:64]) == hash_, "PM: invalid proof hash");
        require(uint256(bytes32(proof_[64:96])) == chain_, "PM: invalid proof chain");
    }
}
