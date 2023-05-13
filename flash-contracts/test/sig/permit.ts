import { TypedDataField } from '@ethersproject/abstract-signer';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { TypedDataDomain } from 'ethers';
import { TEST_CHAIN_ID } from '../common/chainId';
import { Sig, compressSignature } from './compact';

export interface TokenPermit {
  owner: string;
  spender: string;
  value: string | number;
  nonce: string | number;
  deadline: string | number;
}

export const signPermit = async (
  tokenContract: string,
  tokenName: string,
  tokenPermit: TokenPermit,
  signer: SignerWithAddress,
): Promise<Sig> => {
  const domain: TypedDataDomain = {
    name: tokenName,
    version: '1',
    chainId: TEST_CHAIN_ID,
    verifyingContract: tokenContract,
  };

  const types: Record<string, TypedDataField[]> = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  };

  const signature = await signer._signTypedData(domain, types, tokenPermit);
  const sig = compressSignature(signature);
  return sig;
};
