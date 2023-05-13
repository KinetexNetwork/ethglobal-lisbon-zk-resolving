import { ethers } from 'hardhat';
import { loadFixture, mine } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { amount } from './common/amount';
import { hoursToSeconds, nowSeconds } from './common/time';
import { TokenPermit, signPermit } from './sig/permit';
import { gasInfo } from './common/gas';
import { ANOTHER_CHAIN_ID, OTHER_CHAIN_ID, TEST_CHAIN_ID } from './common/chainId';
import { expectLog } from './common/log';
import { OrderStruct } from '../typechain-types/contracts/KinetexFlash';
import { hashOrder } from './sig/order';
import { mockOrderSendProof } from './proof/orderSend';
import { expectRevert } from './common/revert';
import { mockOrderReceiveProof } from './proof/orderReceive';
import { mockWithdrawPrepareProof } from './proof/withdrawPrepare';
import { hashWithdrawPrepare } from './sig/withdraw';

describe('CollateralManagerTest', function () {
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
      fromChain: OTHER_CHAIN_ID,
      fromToken: otherToken.address,
      fromAmount: amount(65),
      toActor: anotherAccount.address,
      toChain: ANOTHER_CHAIN_ID,
      toToken: anotherToken.address,
      toAmount: amount(43),
      collateralChain: TEST_CHAIN_ID,
      collateralAmount: amount(21),
      collateralUnlocked: amount(100),
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

  it('Should accept token deposit', async function () {
    const { accounts, tokens, kinetexFlashTest } = await loadFixture(deployFixture);

    await tokens.collateral.mint(accounts.other.address, amount(12));
    await tokens.collateral.connect(accounts.other).approve(kinetexFlashTest.address, amount(7));

    const amountBefore = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
    const unlockedBefore = await kinetexFlashTest.unlockedCollateralAmount(accounts.other.address, OTHER_CHAIN_ID);
    {
      const { tx, receipt } = await gasInfo(
        'call depositCollateral (first time)',
        await kinetexFlashTest.connect(accounts.other).depositCollateral(amount(4), OTHER_CHAIN_ID),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralDeposit', check: (data) => {
          expect(data.actor).to.be.equal(accounts.other.address);
          expect(data.lockChain).to.be.equal(OTHER_CHAIN_ID);
          expect(data.amount).to.be.equal(amount(4));
        },
      });
    }
    {
      const { tx, receipt } = await gasInfo(
        'call depositCollateral (second time)',
        await kinetexFlashTest.connect(accounts.other).depositCollateral(amount(3), OTHER_CHAIN_ID),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralDeposit', check: (data) => {
          expect(data.actor).to.be.equal(accounts.other.address);
          expect(data.lockChain).to.be.equal(OTHER_CHAIN_ID);
          expect(data.amount).to.be.equal(amount(3));
        },
      });
    }

    const amountAfter = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
    const unlockedAfter = await kinetexFlashTest.unlockedCollateralAmount(accounts.other.address, OTHER_CHAIN_ID);
    expect(amountAfter).to.be.equal(amountBefore.add(amount(7)));
    expect(unlockedAfter).to.be.equal(unlockedBefore.add(amount(7)));
  });

  it('Should accept token deposit with permit via multicall', async function () {
    const { accounts, tokens, kinetexFlashTest } = await loadFixture(deployFixture);

    await tokens.collateral.mint(accounts.other.address, amount(12));

    const permitAmount = amount(7);
    const permitDeadline = await nowSeconds() + hoursToSeconds(1);
    const tokenPermit: TokenPermit = {
      owner: accounts.other.address,
      spender: kinetexFlashTest.address,
      value: permitAmount,
      nonce: 0,
      deadline: permitDeadline,
    };
    const permitSig = await signPermit(
      tokens.collateral.address,
      'Test Token Domain',
      tokenPermit,
      accounts.other,
    );

    const amountBefore = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
    const unlockedBefore = await kinetexFlashTest.unlockedCollateralAmount(accounts.other.address, OTHER_CHAIN_ID);

    {
      const { tx, receipt } = await gasInfo(
        'multicall permit + depositCollateral x2',
        await kinetexFlashTest.connect(accounts.other).multicall([
          kinetexFlashTest.interface.encodeFunctionData('permit', [
            accounts.other.address,
            tokens.collateral.address,
            amount(7),
            permitDeadline,
            permitSig.r,
            permitSig.vs,
          ]),
          kinetexFlashTest.interface.encodeFunctionData('depositCollateral', [amount(4), OTHER_CHAIN_ID]),
          kinetexFlashTest.interface.encodeFunctionData('depositCollateral', [amount(3), OTHER_CHAIN_ID]),
        ]),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralDeposit', check: (data) => {
          expect(data.actor).to.be.equal(accounts.other.address);
          expect(data.lockChain).to.be.equal(OTHER_CHAIN_ID);
          expect(data.amount).to.be.equal(amount(4));
        },
      });
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralDeposit', index: 1, check: (data) => {
          expect(data.actor).to.be.equal(accounts.other.address);
          expect(data.lockChain).to.be.equal(OTHER_CHAIN_ID);
          expect(data.amount).to.be.equal(amount(3));
        },
      });
    }

    const amountAfter = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
    const unlockedAfter = await kinetexFlashTest.unlockedCollateralAmount(accounts.other.address, OTHER_CHAIN_ID);
    expect(amountAfter).to.be.equal(amountBefore.add(amount(7)));
    expect(unlockedAfter).to.be.equal(unlockedBefore.add(amount(7)));
  });

  it('Should withdraw token', async function () {
    const { accounts, tokens, kinetexFlashTest } = await loadFixture(deployFixture);

    await tokens.collateral.mint(accounts.other.address, amount(999));
    await tokens.collateral.connect(accounts.other).approve(kinetexFlashTest.address, amount(999));
    await kinetexFlashTest.connect(accounts.other).depositCollateral(amount(36), OTHER_CHAIN_ID);

    {
      const withdrawHash = hashWithdrawPrepare(
        accounts.other.address,
        OTHER_CHAIN_ID,
        amount(37),
        TEST_CHAIN_ID,
        amount(37),
        0,
      );
      const prepareProof = mockWithdrawPrepareProof(withdrawHash, OTHER_CHAIN_ID);

      await expectRevert(
        kinetexFlashTest.connect(accounts.other).withdrawCollateral(
          amount(37),
          OTHER_CHAIN_ID,
          amount(37),
          prepareProof,
        ),
        'CM: insufficient collateral',
      );
    }

    await kinetexFlashTest.connect(accounts.other).depositCollateral(amount(10), OTHER_CHAIN_ID);

    {
      const withdrawHash = hashWithdrawPrepare(
        accounts.other.address,
        OTHER_CHAIN_ID,
        amount(37),
        TEST_CHAIN_ID,
        amount(37),
        0,
      );
      const prepareProof = mockWithdrawPrepareProof(withdrawHash, OTHER_CHAIN_ID);

      const amountBefore = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
      const balanceBefore = await tokens.collateral.balanceOf(accounts.other.address);

      const { tx, receipt } = await gasInfo(
        'call withdrawCollateral (partially)',
        await kinetexFlashTest.connect(accounts.other).withdrawCollateral(
          amount(37),
          OTHER_CHAIN_ID,
          amount(37),
          prepareProof,
        ),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralWithdraw', check: (data) => {
          expect(data.actor).to.be.equal(accounts.other.address);
          expect(data.lockChain).to.be.equal(OTHER_CHAIN_ID);
          expect(data.amount).to.be.equal(amount(37));
        }
      });

      const amountAfter = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
      const balanceAfter = await tokens.collateral.balanceOf(accounts.other.address);
      expect(amountAfter).to.be.equal(amountBefore.sub(amount(37)));
      expect(balanceAfter).to.be.equal(balanceBefore.add(amount(37)));
    }

    {
      const withdrawHash = hashWithdrawPrepare(
        accounts.other.address,
        OTHER_CHAIN_ID,
        amount(46),
        TEST_CHAIN_ID,
        amount(9),
        1,
      );
      const prepareProof = mockWithdrawPrepareProof(withdrawHash, OTHER_CHAIN_ID);

      const amountBefore = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
      const balanceBefore = await tokens.collateral.balanceOf(accounts.other.address);

      const { tx, receipt } = await gasInfo(
        'call withdrawCollateral (fully)',
        await kinetexFlashTest.connect(accounts.other).withdrawCollateral(
          amount(9),
          OTHER_CHAIN_ID,
          amount(46),
          prepareProof,
        ),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'CollateralWithdraw', check: (data) => {
          expect(data.actor).to.be.equal(accounts.other.address);
          expect(data.lockChain).to.be.equal(OTHER_CHAIN_ID);
          expect(data.amount).to.be.equal(amount(9));
        }
      });

      const amountAfter = await kinetexFlashTest.collateralAmount(accounts.other.address, OTHER_CHAIN_ID);
      const balanceAfter = await tokens.collateral.balanceOf(accounts.other.address);
      expect(amountAfter).to.be.equal(amountBefore.sub(amount(9)));
      expect(balanceAfter).to.be.equal(balanceBefore.add(amount(9)));
    }
  });

  it('Should confirm order', async function () {
    const { accounts, tokens, kinetexFlashTest, order, orderHash } = await loadFixture(deployFixture);

    await tokens.collateral.mint(accounts.another.address, amount(142));
    await tokens.collateral.connect(accounts.another).approve(kinetexFlashTest.address, amount(142));
    await kinetexFlashTest.connect(accounts.another).depositCollateral(amount(142), OTHER_CHAIN_ID);

    const sendProof = mockOrderSendProof(orderHash, order.toChain.toString());

    {
      const resolved = await kinetexFlashTest.orderResolved(accounts.another.address, order.nonce);
      expect(resolved).to.be.equal(false);
    }

    const unlockedBefore = await kinetexFlashTest.unlockedCollateralAmount(accounts.another.address, OTHER_CHAIN_ID);

    {
      const { tx, receipt } = await gasInfo(
        'call confirmOrderAssetSend',
        await kinetexFlashTest.connect(accounts.another).confirmOrderAssetSend(order, sendProof),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'OrderSendConfirm', check: (data) => {
          expect(data.orderHash).to.be.equal(orderHash);
        }
      });
    }

    {
      const resolved = await kinetexFlashTest.orderResolved(accounts.another.address, order.nonce);
      expect(resolved).to.be.equal(true);
    }

    const unlockedAfter = await kinetexFlashTest.unlockedCollateralAmount(accounts.another.address, OTHER_CHAIN_ID);
    expect(unlockedAfter).to.be.equal(unlockedBefore.add(amount(21)));

    await expectRevert(
      kinetexFlashTest.connect(accounts.another).confirmOrderAssetSend(order, sendProof),
      'CM: order already resolved',
    );
  });

  it('Should slash order', async function () {
    const { accounts, tokens, kinetexFlashTest, order, orderHash } = await loadFixture(deployFixture);

    await tokens.collateral.mint(accounts.another.address, amount(142));
    await tokens.collateral.connect(accounts.another).approve(kinetexFlashTest.address, amount(142));
    await kinetexFlashTest.connect(accounts.another).depositCollateral(amount(142), OTHER_CHAIN_ID);

    const receiveProof = mockOrderReceiveProof(orderHash, order.fromChain.toString());

    {
      const resolved = await kinetexFlashTest.orderResolved(accounts.another.address, order.nonce);
      expect(resolved).to.be.equal(false);
    }

    const unlockedBefore = await kinetexFlashTest.unlockedCollateralAmount(accounts.another.address, OTHER_CHAIN_ID);
    const balanceBefore = await tokens.collateral.balanceOf(accounts.other.address);

    await expectRevert(
      kinetexFlashTest.slashOrderCollateral(order, receiveProof),
      'CM: slash not reached',
    );

    // deadline is ~ in 1h, 260 * 15s = 1h 5m passed
    await mine(260, { interval: 15 });

    {
      const { tx, receipt } = await gasInfo(
        'call slashOrderCollateral',
        await kinetexFlashTest.slashOrderCollateral(order, receiveProof),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'OrderCollateralSlash', check: (data) => {
          expect(data.orderHash).to.be.equal(orderHash);
        }
      });
    }

    {
      const resolved = await kinetexFlashTest.orderResolved(accounts.another.address, order.nonce);
      expect(resolved).to.be.equal(true);
    }

    const unlockedAfter = await kinetexFlashTest.unlockedCollateralAmount(accounts.another.address, OTHER_CHAIN_ID);
    const balanceAfter = await tokens.collateral.balanceOf(accounts.other.address);
    expect(unlockedAfter).to.be.equal(unlockedBefore);
    expect(balanceAfter).to.be.equal(balanceBefore.add(amount(21)));

    await expectRevert(
      kinetexFlashTest.connect(accounts.another).confirmOrderAssetSend(order, receiveProof),
      'CM: order already resolved',
    );
  });
});
