import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { printGasInfo } from './common/gas';

describe('NonceBitmapTest', function () {
  async function deployFixture() {
    const NonceBitmapTest = await ethers.getContractFactory('NonceBitmapTest');
    const nonceBitmapTest = await NonceBitmapTest.deploy();
    return { nonceBitmapTest };
  }

  it('Should invalidate and return nonce validity via bitmap', async function () {
    const { nonceBitmapTest } = await loadFixture(deployFixture);

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      await nonceBitmapTest.invalidateNonce(1);
      const gasUsed = await nonceBitmapTest.lastGasUsed();
      printGasInfo('invalidate nonce (first-word)', gasUsed);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      // Ensure no bit flips
      await nonceBitmapTest.invalidateNonce(1);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      await nonceBitmapTest.invalidateNonce(0);
      const gasUsed = await nonceBitmapTest.lastGasUsed();
      printGasInfo('invalidate nonce (first-word-neighbor)', gasUsed);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      await nonceBitmapTest.ensureNonceValidThenInvalidate(2);
      const gasUsed = await nonceBitmapTest.lastGasUsed();
      printGasInfo('check validity & invalidate nonce (first-word-neighbor)', gasUsed);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      await nonceBitmapTest.invalidateNonce(255);
      const gasUsed = await nonceBitmapTest.lastGasUsed();
      printGasInfo('invalidate nonce (first-word-neighbor, last-word-bit)', gasUsed);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      await nonceBitmapTest.invalidateNonce(256);
      const gasUsed = await nonceBitmapTest.lastGasUsed();
      printGasInfo('invalidate nonce (second-word)', gasUsed);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(true);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      await nonceBitmapTest.invalidateNonce(257);
      const gasUsed = await nonceBitmapTest.lastGasUsed();
      printGasInfo('invalidate nonce (second-word-neighbor)', gasUsed);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(true);

    {
      await nonceBitmapTest.ensureNonceValidThenInvalidate(333);
      const gasUsed = await nonceBitmapTest.lastGasUsed();
      printGasInfo('check validity & invalidate nonce (second-word-neighbor)', gasUsed);
    }

    await expect(nonceBitmapTest.isNonceValid(0)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(1)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(2)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(255)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(256)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(257)).to.eventually.be.equal(false);
    await expect(nonceBitmapTest.isNonceValid(333)).to.eventually.be.equal(false);
  });
});
