import { defaultAbiCoder, keccak256 } from 'ethers/lib/utils';

export const hashWithdrawPrepare = (
  collateralActor: string,
  lockChain: string | number,
  lockAmount: string | number,
  unlockChain: string | number,
  amount: string | number,
  nonce: string | number
): string => {
  const payload = defaultAbiCoder.encode(
    [
      'tuple(' +
        'address collateralActor,' +
        'uint256 lockChain,' +
        'uint256 lockAmount,' +
        'uint256 unlockChain,' +
        'uint256 amount,' +
        'uint256 nonce' +
      ')'
    ],
    [
      {
        collateralActor,
        lockChain,
        lockAmount,
        unlockChain,
        amount,
        nonce,
      }
    ],
  );
  const hash = keccak256(payload);
  return hash;
};
