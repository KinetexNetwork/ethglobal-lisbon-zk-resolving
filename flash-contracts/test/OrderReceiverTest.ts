import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { amount } from './common/amount';
import { hoursToSeconds, nowSeconds } from './common/time';
import { gasInfo } from './common/gas';
import { ANOTHER_CHAIN_ID, OTHER_CHAIN_ID, TEST_CHAIN_ID } from './common/chainId';
import { expectLog } from './common/log';
import { OrderStruct } from '../typechain-types/contracts/KinetexFlash';
import { hashOrder, signOrder } from './sig/order';
import { expectRevert } from './common/revert';
import { hashWithdrawPrepare } from './sig/withdraw';
import { BigNumber } from 'ethers';

describe('OrderReceiverTest', function () {
  async function deployFixture() {
    const [ownerAccount, otherAccount, anotherAccount] = await ethers.getSigners();

    const TokenMock = await ethers.getContractFactory('PermitTokenMock');
    const collateralToken = await TokenMock.deploy();
    const otherToken = await TokenMock.deploy();
    const anotherToken = await TokenMock.deploy();

    const KinetexFlashTest = await ethers.getContractFactory('KinetexFlashTest');
    const kinetexFlashTest = await KinetexFlashTest.deploy(collateralToken.address);

    const order: OrderStruct = {
      fromActor: otherAccount.address,
      fromChain: TEST_CHAIN_ID,
      fromToken: otherToken.address,
      fromAmount: amount(65),
      toActor: anotherAccount.address,
      toChain: ANOTHER_CHAIN_ID,
      toToken: anotherToken.address,
      toAmount: amount(43),
      collateralChain: OTHER_CHAIN_ID,
      collateralAmount: amount(21),
      collateralUnlocked: amount(25),
      deadline: await nowSeconds() + hoursToSeconds(1),
      nonce: 13377331,
    };
    const orderHash = hashOrder(order);

    return {
      accounts: {
        owner: ownerAccount,
        other: otherAccount,
        another: anotherAccount,
      },
      tokens: {
        collateral: collateralToken,
        other: otherToken,
        another: anotherToken,
      },
      kinetexFlashTest,
      order,
      orderHash,
    };
  }

  it('Should receive order asset', async function () {
    const { accounts, tokens, kinetexFlashTest, order, orderHash } = await loadFixture(deployFixture);

    await tokens.other.mint(accounts.other.address, amount(123));
    await tokens.other.connect(accounts.other).approve(kinetexFlashTest.address, amount(65));

    const orderSig = await signOrder(order, accounts.other);

    await kinetexFlashTest.setLockedCollateralAmount(accounts.another.address, amount(5)); // 25 - 5 = 20 >= 21 (❌)

    await expectRevert(
      kinetexFlashTest.receiveOrderAsset(order, orderSig.r, orderSig.vs),
      'OR: invalid caller',
    );

    await expectRevert(
      kinetexFlashTest.connect(accounts.another).receiveOrderAsset(order, orderSig.r, orderSig.vs),
      'OR: insufficient collateral',
    );

    await kinetexFlashTest.setLockedCollateralAmount(accounts.another.address, amount(4)); // 25 - 4 = 21 >= 21 (✅)

    {
      const received = await kinetexFlashTest.orderAssetReceived(accounts.another.address, order.nonce);
      expect(received).to.be.equal(false);
    }

    const otherBalanceBefore = await tokens.other.balanceOf(accounts.other.address);
    const anotherBalanceBefore = await tokens.other.balanceOf(accounts.another.address);
    const lockedCollateralBefore = await kinetexFlashTest.lockedCollateralAmount(accounts.another.address);

    {
      const { tx, receipt } = await gasInfo(
        'call receiveOrderAsset (first)',
        await kinetexFlashTest.connect(accounts.another).receiveOrderAsset(order, orderSig.r, orderSig.vs),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'AssetReceive', check: (data) => {
          expect(data.orderHash).to.be.equal(orderHash);
        },
      });
    }

    {
      const received = await kinetexFlashTest.orderAssetReceived(accounts.another.address, order.nonce);
      expect(received).to.be.equal(true);
    }

    const otherBalanceAfter = await tokens.other.balanceOf(accounts.other.address);
    const anotherBalanceAfter = await tokens.other.balanceOf(accounts.another.address);
    const lockedCollateralAfter = await kinetexFlashTest.lockedCollateralAmount(accounts.another.address);
    expect(otherBalanceAfter).to.be.equal(otherBalanceBefore.sub(amount(65)));
    expect(anotherBalanceAfter).to.be.equal(anotherBalanceBefore.add(amount(65)));
    expect(lockedCollateralAfter).to.be.equal(lockedCollateralBefore.add(amount(21)));

    await expectRevert(
      kinetexFlashTest.connect(accounts.another).receiveOrderAsset(order, orderSig.r, orderSig.vs),
      'OR: already received for order',
    );

    {
      const neighborOrder = {
        ...order,
        fromAmount: amount(33),
        nonce: BigNumber.from(order.nonce).add(1),
        collateralUnlocked: BigNumber.from(order.collateralUnlocked).add(BigNumber.from(order.collateralAmount)),
      };
      const neighborOrderSig = await signOrder(neighborOrder, accounts.other);

      await tokens.other.connect(accounts.other).approve(kinetexFlashTest.address, amount(33));

      await gasInfo(
        'call receiveOrderAsset (neighbor)',
        await kinetexFlashTest.connect(accounts.another).receiveOrderAsset(neighborOrder, neighborOrderSig.r, neighborOrderSig.vs),
      );
    }
  });

  it('Should prepare collateral withdraw', async function () {
    const { accounts, kinetexFlashTest } = await loadFixture(deployFixture);

    await kinetexFlashTest.setLockedCollateralAmount(accounts.other.address, amount(111));
    const lockedBefore = await kinetexFlashTest.lockedCollateralAmount(accounts.other.address);

    {
      const { tx, receipt } = await gasInfo(
        'call prepareCollateralWithdraw (first time)',
        await kinetexFlashTest.connect(accounts.other).prepareCollateralWithdraw(amount(9), ANOTHER_CHAIN_ID),
      );
      const lockAmount = await kinetexFlashTest.lockedCollateralAmount(accounts.other.address);
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralWithdrawPrepare', check: (data) => {
          const withdrawHash = hashWithdrawPrepare(
            accounts.other.address,
            TEST_CHAIN_ID,
            lockAmount.toString(),
            ANOTHER_CHAIN_ID,
            amount(9),
            0,
          );
          expect(data.withdrawHash).to.be.equal(withdrawHash);
        },
      });
    }

    {
      const { tx, receipt } = await gasInfo(
        'call prepareCollateralWithdraw (second time)',
        await kinetexFlashTest.connect(accounts.other).prepareCollateralWithdraw(amount(13), ANOTHER_CHAIN_ID),
      );
      const lockAmount = await kinetexFlashTest.lockedCollateralAmount(accounts.other.address);
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralWithdrawPrepare', check: (data) => {
          const withdrawHash = hashWithdrawPrepare(
            accounts.other.address,
            TEST_CHAIN_ID,
            lockAmount.toString(),
            ANOTHER_CHAIN_ID,
            amount(13),
            1,
          );
          expect(data.withdrawHash).to.be.equal(withdrawHash);
        },
      });
    }

    const lockedAfter = await kinetexFlashTest.lockedCollateralAmount(accounts.other.address);
    expect(lockedAfter).to.be.equal(lockedBefore.add(amount(22)));
  });
});
