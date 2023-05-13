import { Crypto } from 'models';
import { CRYPTOS, CRYPTOS_FROM, CRYPTOS_FROM_TO, CRYPTOS_TO } from 'models/constants';
import { useCallback, useMemo } from 'react';

export type CryptoType = 'swap-from' | 'swap-to' | 'swap-from-or-to';

type CryptosParams = {
  type?: CryptoType;
};

export const useCryptos = (params?: CryptosParams): Crypto[] => {
  const { type } = params ?? {};

  const cryptoSet = useMemo(() => {
    switch (type) {
      case 'swap-from':
        return CRYPTOS_FROM;
      case 'swap-to':
        return CRYPTOS_TO;
      case 'swap-from-or-to':
        return CRYPTOS_FROM_TO;
      default:
        return CRYPTOS;
    }
  }, [type]);

  const cryptos = useMemo(() => [...cryptoSet], [cryptoSet]);

  return cryptos;
};

export type CryptoGetter = (cryptoId: string) => Crypto | undefined;

export const useGetCrypto = (params?: CryptosParams): CryptoGetter => {
  const cryptos = useCryptos(params);
  const cryptoMap = useMemo(() => new Map(cryptos.map((crypto) => [crypto.id, crypto])), [cryptos]);
  const getCrypto: CryptoGetter = useCallback((cryptoId) => cryptoMap.get(cryptoId), [cryptoMap]);
  return getCrypto;
};
