import { splitSignature } from 'ethers/lib/utils';

export type Sig = {
  r: string;
  vs: string;
}

export const compressSignature = (signature: string): Sig => {
  const split = splitSignature(signature);
  return { r: split.r, vs: split._vs };
};
