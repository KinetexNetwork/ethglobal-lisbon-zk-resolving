// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

struct HashEventProof {
    uint64 srcSlot;
    uint64 txSlot;
    bytes32[] receiptsRootProof;
    bytes32 receiptsRoot;
    bytes[] receiptProof;
    bytes txIndexRLPEncoded;
    uint256 logIndex;
}
