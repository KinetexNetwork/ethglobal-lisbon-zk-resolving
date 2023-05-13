// SPDX-License-Identifier: BUSL-1.1

pragma solidity 0.8.18;

library NonceBitmapLib {
    function isNonceValid(uint256 nonce_, mapping(uint256 => uint256) storage bitmap_) internal view returns (bool) {
        (uint256 wordPos, uint256 bitMask) = _locate(nonce_);
        return bitmap_[wordPos] & bitMask == 0;
    }

    function invalidateNonce(uint256 nonce_, mapping(uint256 => uint256) storage bitmap_) internal {
        (uint256 wordPos, uint256 bitMask) = _locate(nonce_);
        bitmap_[wordPos] |= bitMask;
    }

    function _locate(uint256 nonce_) private pure returns (uint256 wordPos, uint256 bitMask) {
        wordPos = uint248(nonce_ >> 8);
        bitMask = 1 << uint8(nonce_);
    }
}
