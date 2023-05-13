import { Amount, Crypto } from 'models';
import { atom, selector } from 'recoil';

import { ZERO_AMOUNT } from 'helpers/amount';
import { isNull } from 'helpers/null';

const ns = (key: string): string => {
  return `swapParams/${key}`;
};

export const fromCryptoSelector = atom<Crypto | undefined>({
  key: ns('fromCryptoSelector'),
  default: undefined,
});

export const fromAmountSelector = atom<Amount>({
  key: ns('fromAmountSelector'),
  default: ZERO_AMOUNT,
});

export const toCryptoSelector = atom<Crypto | undefined>({
  key: ns('toCryptoSelector'),
  default: undefined,
});

export const sameCryptoSelector = selector<boolean>({
  key: ns('sameCryptoSelector'),
  get: ({ get }) => {
    const fromCrypto = get(fromCryptoSelector);
    if (isNull(fromCrypto)) {
      return false;
    }

    const toCrypto = get(toCryptoSelector);
    if (isNull(toCrypto)) {
      return false;
    }

    const sameId = fromCrypto.id === toCrypto.id;
    return sameId;
  },
});
