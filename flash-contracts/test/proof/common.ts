import { defaultAbiCoder } from '@ethersproject/abi';
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';

export const mockHashEventProof = (event: string, hash: string, chain: string | number): string => {
  const sig = keccak256(toUtf8Bytes(event));
  const proof = defaultAbiCoder.encode(['bytes32', 'bytes32', 'uint256'], [sig, hash, chain]);
  return proof;
};
