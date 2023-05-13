import { expect } from 'chai';
import { reason } from './reason';

export const expectRevert = async <T>(promise: Promise<T>, revertMessage: string) => {
  try {
    await expect(promise).to.be.eventually.rejectedWith(reason(revertMessage));
  } catch (e) {
    console.log('--- Revert reason error ---');
    console.log(e);
    console.log('---');
    throw e;
  }
};
