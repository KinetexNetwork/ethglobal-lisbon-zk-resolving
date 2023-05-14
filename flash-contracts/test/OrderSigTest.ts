import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { OrderStruct } from '../typechain-types/contracts/KinetexFlash';
import { signOrder } from './sig/order';
import { expect } from 'chai';
import { printGasInfo } from './common/gas';

describe('OrderSigTest', function () {
  async function deployFixture() {
    const [ownerAccount, otherAccount, anotherAccount] = await ethers.getSigners();

    const OrderSigTest = await ethers.getContractFactory('OrderSigTest');
    const orderSigTest = await OrderSigTest.deploy();

    const order: OrderStruct = {
      fromActor: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      fromChain: '512',
      fromToken: '0x0101010101010101010101010101010101010101',
      fromAmount: '1234',
      toActor: '0xdeadc0dedeadc0dedeadc0dedeadc0dedeadc0de',
      toChain: '1024',
      toToken: '0x0202020202020202020202020202020202020202',
      toAmount: '3456',
      collateralChain: '69',
      collateralAmount: '1234',
      collateralBounty: '3301',
      collateralUnlocked: '6996',
      deadline: '12345678901234567890',
      nonce: '421337',
    };

    return {
      accounts: {
        owner: ownerAccount,
        other: otherAccount,
        another: anotherAccount,
      },
      orderSigTest,
      order,
    };
  }

  it('Should recover signer of valid Order sig', async function () {
    const { accounts, orderSigTest, order } = await loadFixture(deployFixture);

    const orderSig = await signOrder(order, accounts.other);
    await orderSigTest.testSignature(order, orderSig.r, orderSig.vs);
    expect(orderSigTest.lastSigner()).to.eventually.be.equal(accounts.other.address);

    const gasBefore = await orderSigTest.lastGasBefore();
    const gasAfterHash = await orderSigTest.lastGasAfterHash();
    const gasAfterSig = await orderSigTest.lastGasAfterSig();
    printGasInfo('calc order hash', gasBefore.sub(gasAfterHash));
    printGasInfo('validate order sig', gasAfterHash.sub(gasAfterSig));
  });

  it('Should not recover signer of invalid Order sig', async function () {
    const { accounts, orderSigTest, order } = await loadFixture(deployFixture);

    const flipHexBit = (originalHexBytes: string, charToModifyIndex: number): string => {
      function flipLastBit(hexChar: string): string {
        return (parseInt(hexChar, 16) ^ 1).toString(16);
      }

      const charToModify = originalHexBytes[charToModifyIndex];
      const modifiedChar = flipLastBit(charToModify);
      const alteredHexBytes = (
        originalHexBytes.slice(0, charToModifyIndex) +
        modifiedChar +
        originalHexBytes.slice(charToModifyIndex + 1)
      );
      return alteredHexBytes;
    };

    const orderSig = await signOrder(order, accounts.other);
    await orderSigTest.testSignature(order, orderSig.r, flipHexBit(orderSig.vs, 60));
    expect(orderSigTest.lastSigner()).to.eventually.be.not.equal(accounts.other.address);
  });
});
