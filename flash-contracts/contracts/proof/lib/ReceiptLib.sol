// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

library ReceiptLib {
    uint256 private constant HISTORICAL_ROOTS_LIMIT = 16777216;
    uint256 private constant SLOTS_PER_HISTORICAL_ROOT = 8192;

    function verifyReceiptsRoot(
        bytes32 receiptsRoot_,
        bytes32[] memory receiptsRootProof_,
        bytes32 headerRoot_,
        uint64 srcSlot_,
        uint64 txSlot_,
        uint256 srcChain_
    ) internal pure {
        uint256 capellaForkSlot = _getCapellaSlot(srcChain_);

        // In Bellatrix we use state.historical_roots, in Capella we use state.historical_summaries
        // We use < here because capellaForkSlot is the last slot processed using Bellatrix logic;
        // the last batch in state.historical_roots contains the 8192 slots *before* capellaForkSlot.
        uint256 stateToHistoricalGIndex = srcChain_ < capellaForkSlot ? 7 : 27;

        // The list state.historical_summaries is empty at the beginning of Capella
        uint256 historicalListIndex = txSlot_ < capellaForkSlot
            ? txSlot_ / SLOTS_PER_HISTORICAL_ROOT
            : (txSlot_ - capellaForkSlot) / SLOTS_PER_HISTORICAL_ROOT;

        uint256 index;
        if (srcSlot_ == txSlot_) {
            index = 8 + 3;
            index = index * 2 ** 9 + 387;
        } else if (srcSlot_ - txSlot_ <= SLOTS_PER_HISTORICAL_ROOT) {
            index = 8 + 3;
            index = index * 2 ** 5 + 6;
            index = index * SLOTS_PER_HISTORICAL_ROOT + (txSlot_ % SLOTS_PER_HISTORICAL_ROOT);
            index = index * 2 ** 9 + 387;
        } else if (txSlot_ < srcSlot_) {
            index = 8 + 3;
            index = index * 2 ** 5 + stateToHistoricalGIndex;
            index = index * 2 + 0;
            index = index * HISTORICAL_ROOTS_LIMIT + historicalListIndex;
            index = index * 2 + 1;
            index = index * SLOTS_PER_HISTORICAL_ROOT + (txSlot_ % SLOTS_PER_HISTORICAL_ROOT);
            index = index * 2 ** 9 + 387;
        } else {
            revert("RL: invalid target slot");
        }

        bytes32 restoredMerkleRoot = _restoreMerkleRoot(receiptsRoot_, index, receiptsRootProof_);
        require(restoredMerkleRoot == headerRoot_, "RL: invalid receipts root proof");
    }

    function _getCapellaSlot(uint256 chain_) private pure returns (uint256) {
        // Returns CAPELLA_FORK_EPOCH * SLOTS_PER_EPOCH for the corresponding beacon chain.
        if (chain_ == 1) {
            // https://github.com/ethereum/consensus-specs/blob/dev/specs/capella/fork.md?plain=1#L30
            return 6209536;
        }

        if (chain_ == 5) {
            // https://blog.ethereum.org/2023/03/08/goerli-shapella-announcement
            // https://github.com/eth-clients/goerli/blob/main/prater/config.yaml#L43
            return 5193728;
        }

        // We don't know the exact value for Gnosis Chain yet so we return max uint256
        // and fallback to bellatrix logic.
        return 2 ** 256 - 1;
    }

    function _restoreMerkleRoot(
        bytes32 leaf_,
        uint256 index_,
        bytes32[] memory branch_
    ) private pure returns (bytes32) {
        require(2 ** (branch_.length + 1) > index_, "RL: invalid merkle branch");
        bytes32 value = leaf_;
        uint256 i = 0;
        while (index_ != 1) {
            if (index_ % 2 == 1) {
                value = sha256(bytes.concat(branch_[i], value));
            } else {
                value = sha256(bytes.concat(value, branch_[i]));
            }
            index_ /= 2;
            i++;
        }
        return value;
    }
}
