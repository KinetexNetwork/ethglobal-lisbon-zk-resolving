import { signTypedData as wagmiSignTypedData } from '@wagmi/core';
import { TypedDataField } from 'ethers';

import { isNotNull, isNull } from 'helpers/null';

export const ANY_CHAIN: number = -1;

export const normalizeChainId = (chainId?: string): number => {
  return isNotNull(chainId) ? Number(chainId) : ANY_CHAIN;
};

export const normalizeAddress = (address: string): string => {
  return address;
};

const toHexNumber = async (num: string): Promise<string> => {
  const { BigNumber } = await import('ethers');
  const bn = BigNumber.from(num);
  const hexStr = bn.toHexString();
  return hexStr;
};

export const normalizeValue = async (value: string | undefined): Promise<string | undefined> => {
  if (isNull(value)) {
    return undefined;
  }

  return await toHexNumber(value);
};

export const normalizeData = <T extends string | undefined>(data: T): T => {
  return data;
};

type TypedDataArgs = Parameters<typeof wagmiSignTypedData>[0] & {
  types: Record<string, TypedDataField[]>;
};

export const normalizeTypedData = (data: string): TypedDataArgs => {
  const signable = JSON.parse(data);
  const domain = signable['domain'];
  const value = signable['message'];
  const types = signable['types'];
  delete types['EIP712Domain'];
  return { domain, value, types };
};
