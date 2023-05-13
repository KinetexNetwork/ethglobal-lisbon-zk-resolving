import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { amount } from './common/amount';
import { hoursToSeconds, nowSeconds } from './common/time';
import { gasInfo } from './common/gas';
import { ANOTHER_CHAIN_ID, OTHER_CHAIN_ID, TEST_CHAIN_ID } from './common/chainId';
import { expectLog } from './common/log';
import { OrderStruct } from '../typechain-types/contracts/KinetexFlash';
import { hashOrder } from './sig/order';
import { expectRevert } from './common/revert';

describe('OrderSenderTest', function () {
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
      toChain: TEST_CHAIN_ID,
      toToken: anotherToken.address,
      toAmount: amount(43),
      collateralChain: ANOTHER_CHAIN_ID,
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

  it('Should send order asset', async function () {
    const { accounts, tokens, kinetexFlashTest, order, orderHash } = await loadFixture(deployFixture);

    await tokens.another.mint(accounts.another.address, amount(123));
    await tokens.another.connect(accounts.another).approve(kinetexFlashTest.address, amount(43));

    await expectRevert(
      kinetexFlashTest.sendOrderAsset(order),
      'OS: invalid caller',
    );

    const anotherBalanceBefore = await tokens.another.balanceOf(accounts.another.address);
    const otherBalanceBefore = await tokens.another.balanceOf(accounts.other.address);

    {
      const { tx, receipt } = await gasInfo(
        'call sendOrderAsset',
        await kinetexFlashTest.connect(accounts.another).sendOrderAsset(order),
      );
      expectLog({
        contract: kinetexFlashTest, tx, receipt, name: 'AssetSend', check: (data) => {
          expect(data.orderHash).to.be.equal(orderHash);
        },
      });
    }

    const anotherBalanceAfter = await tokens.another.balanceOf(accounts.another.address);
    const otherBalanceAfter = await tokens.another.balanceOf(accounts.other.address);
    expect(anotherBalanceAfter).to.be.equal(anotherBalanceBefore.sub(amount(43)));
    expect(otherBalanceAfter).to.be.equal(otherBalanceBefore.add(amount(43)));
  });
});
