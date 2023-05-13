const CRYPTO_ID_SEPARATOR = '/';

export type CryptoIdSource = {
  chainId: string;
  address: string;
};

export const makeCryptoId = (source: CryptoIdSource): string => {
  const { chainId, address } = source;
  const id = [chainId, address].join(CRYPTO_ID_SEPARATOR).toLowerCase();
  return id;
};
