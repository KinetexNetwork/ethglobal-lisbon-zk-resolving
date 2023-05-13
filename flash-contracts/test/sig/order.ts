import { TypedDataDomain, TypedDataField } from 'ethers';
import { OrderStruct } from '../../typechain-types/contracts/KinetexFlash';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Sig, compressSignature } from './compact';
import { _TypedDataEncoder } from 'ethers/lib/utils';

const DOMAIN: TypedDataDomain = {
  name: 'KinetexFlash',
};

const ORDER_TYPES: Record<string, TypedDataField[]> = {
  Order: [
    { type: 'address', name: 'fromActor' },
    { type: 'uint256', name: 'fromChain' },
    { type: 'address', name: 'fromToken' },
    { type: 'uint256', name: 'fromAmount' },
    { type: 'address', name: 'toActor' },
    { type: 'uint256', name: 'toChain' },
    { type: 'address', name: 'toToken' },
    { type: 'uint256', name: 'toAmount' },
    { type: 'uint256', name: 'collateralChain' },
    { type: 'uint256', name: 'collateralAmount' },
    { type: 'uint256', name: 'collateralUnlocked' },
    { type: 'uint256', name: 'deadline' },
    { type: 'uint256', name: 'nonce' },
  ],
};

export const signOrder = async (
  order: OrderStruct,
  signer: SignerWithAddress,
): Promise<Sig> => {
  const signature = await signer._signTypedData(DOMAIN, ORDER_TYPES, order);
  const sig = compressSignature(signature);
  return sig;
};

export const hashOrder = (order: OrderStruct): string => {
  const hash = _TypedDataEncoder.hash(DOMAIN, ORDER_TYPES, order);
  return hash;
};
