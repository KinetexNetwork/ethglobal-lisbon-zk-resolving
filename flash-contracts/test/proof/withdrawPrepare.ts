import { mockHashEventProof } from './common';

export const mockWithdrawPrepareProof = (withdrawHash: string, lockChain: string | number): string => {
  return mockHashEventProof('CollateralWithdrawPrepare(bytes32)', withdrawHash, lockChain);
};
