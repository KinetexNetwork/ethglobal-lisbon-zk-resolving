import { cryptoIcon } from 'helpers/crypto';

import { makeCryptoId } from './cryptoId';
import { Chain, Crypto } from './models';

const UNKNOWN_NAME = 'Unknown';
const UNKNOWN_SYMBOL = '???';
const UNKNOWN_ICON = cryptoIcon();

export const makeUnknownChain = (id: string): Chain => {
  const chain: Chain = {
    id,
    name: UNKNOWN_NAME,
    icon: UNKNOWN_ICON,
  };
  return chain;
};

export const makeUnknownCrypto = (chainId: string, address: string): Crypto => {
  const crypto: Crypto = {
    id: makeCryptoId({ chainId, address }),
    name: UNKNOWN_NAME,
    symbol: UNKNOWN_SYMBOL,
    address,
    chain: makeUnknownChain(chainId),
    icon: UNKNOWN_ICON,
    decimals: 0,
    permit: false,
  };
  return crypto;
};
