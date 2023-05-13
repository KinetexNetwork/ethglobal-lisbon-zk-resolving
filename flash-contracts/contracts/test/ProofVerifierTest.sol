// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {ProofChainConfig} from "../proof/interfaces/ProofChainConfig.sol";
import {ProofVerifier} from "../proof/ProofVerifier.sol";

contract ProofVerifierTest is ProofVerifier {
    uint256 public lastGasUsed;

    // prettier-ignore
    constructor(ProofChainConfig[] memory proofChainConfigs_)
        ProofVerifier(proofChainConfigs_)
    {} // solhint-disable no-empty-blocks

    function verifyHashEventProofTest(bytes32 sig_, bytes32 hash_, uint256 chain_, bytes calldata proof_) external {
        uint256 gasBefore = gasleft();
        this.verifyHashEventProof(sig_, hash_, chain_, proof_);
        uint256 gasAfter = gasleft();
        lastGasUsed = gasBefore - gasAfter;
    }
}
