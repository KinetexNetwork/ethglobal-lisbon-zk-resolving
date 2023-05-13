// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

import {IProofVerifier} from "./interfaces/IProofVerifier.sol";
import {ILightClient} from "./interfaces/ILightClient.sol";
import {ProofChainConfig} from "./interfaces/ProofChainConfig.sol";
import {HashEventProof} from "./interfaces/HashEventProof.sol";

import {EnvLib} from "../core/EnvLib.sol";

import {ReceiptLib} from "./lib/ReceiptLib.sol";
import {EventLib} from "./lib/EventLib.sol";

contract ProofVerifier is IProofVerifier {
    mapping(uint256 => address) public lightClients;
    mapping(uint256 => address) public broadcasters;

    uint256 public constant MIN_LIGHT_CLIENT_DELAY = 30 seconds;

    uint256 private constant HASH_TOPIC_INDEX = 1; // Topic #0 is hash of event signature

    constructor(ProofChainConfig[] memory proofChainConfigs_) {
        for (uint256 i = 0; i < proofChainConfigs_.length; i++) {
            ProofChainConfig memory config = proofChainConfigs_[i];
            lightClients[config.chain] = config.lightClient;
            broadcasters[config.chain] = config.broadcaster;
        }
    }

    function verifyHashEventProof(
        bytes32 sig_,
        bytes32 hash_,
        uint256 chain_,
        bytes calldata proof_
    ) external view virtual {
        HashEventProof memory eventProof = abi.decode(proof_, (HashEventProof));

        // Verify broadcaster set
        address broadcaster = broadcasters[chain_];
        require(broadcaster != address(0), "PV: no broadcaster");

        // Verify light client set & consistent
        address lightClient = lightClients[chain_];
        require(lightClient != address(0), "PV: no light client");
        require(ILightClient(lightClient).consistent(), "PV: light client inconsistent");

        // Verify light client delay
        {
            uint256 slotTimestamp = ILightClient(lightClient).timestamps(eventProof.srcSlot);
            require(slotTimestamp != 0, "PV: no timestamp for slot");
            uint256 elapsedTime = EnvLib.timeNow() - slotTimestamp;
            require(elapsedTime >= MIN_LIGHT_CLIENT_DELAY, "PV: slot not settled yet");
        }

        // Verify receipts root
        {
            bytes32 headerRoot = ILightClient(lightClient).headers(eventProof.srcSlot);
            require(headerRoot != bytes32(0), "PV: no header root");
            ReceiptLib.verifyReceiptsRoot(
                eventProof.receiptsRoot,
                eventProof.receiptsRootProof,
                headerRoot,
                eventProof.srcSlot,
                eventProof.txSlot,
                chain_
            );
        }

        // Verify hash topic
        {
            bytes32 eventHash = EventLib.getEventTopic(
                eventProof.receiptProof,
                eventProof.receiptsRoot,
                eventProof.txIndexRLPEncoded,
                eventProof.logIndex,
                broadcaster,
                sig_,
                HASH_TOPIC_INDEX
            );
            require(eventHash == hash_, "PV: invalid event hash");
        }
    }
}
