import { cryptoIconS3 } from '../cryptoIcon';
import { makeCryptoId } from '../cryptoId';
import { Crypto } from '../models';

import { ETHEREUM_CHAIN, FANTOM_CHAIN, GNOSIS_CHAIN, GOERLI_CHAIN, POLYGON_CHAIN } from './chains';

// Ethereum

const ETHEREUM_UNISWAP_ADDRESS = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984';
export const ETHEREUM_UNISWAP_CRYPTO: Crypto = {
  id: makeCryptoId({ chainId: ETHEREUM_CHAIN.id, address: ETHEREUM_UNISWAP_ADDRESS }),
  name: 'Uniswap',
  symbol: 'UNI',
  chain: ETHEREUM_CHAIN,
  icon: cryptoIconS3('3ZqEK4'),
  address: ETHEREUM_UNISWAP_ADDRESS,
  decimals: 18,
  permit: true,
};

const ETHEREUM_WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
export const ETHEREUM_WETH_CRYPTO: Crypto = {
  id: makeCryptoId({ chainId: ETHEREUM_CHAIN.id, address: ETHEREUM_WETH_ADDRESS }),
  name: 'wEther',
  symbol: 'WETH',
  chain: ETHEREUM_CHAIN,
  icon: cryptoIconS3('29bRLr'),
  address: ETHEREUM_WETH_ADDRESS,
  decimals: 18,
  permit: false,
};

// Goerli

const GOERLI_WETH_ADDRESS = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6';
export const GOERLI_WETH_CRYPTO: Crypto = {
  id: makeCryptoId({ chainId: GOERLI_CHAIN.id, address: GOERLI_WETH_ADDRESS }),
  name: 'wEthër',
  symbol: 'WETH',
  chain: GOERLI_CHAIN,
  icon: cryptoIconS3('29bRLr'),
  address: GOERLI_WETH_ADDRESS,
  decimals: 18,
  permit: false,
};

// Gnosis

const GNOSIS_CHAINLINK_ADDRESS = '0xe2e73a1c69ecf83f464efce6a5be353a37ca09b2';
export const GNOSIS_CHAINLINK_CRYPTO: Crypto = {
  id: makeCryptoId({ chainId: GNOSIS_CHAIN.id, address: GNOSIS_CHAINLINK_ADDRESS }),
  name: 'Chainlink',
  symbol: 'LINK',
  chain: GNOSIS_CHAIN,
  icon: cryptoIconS3('SPPmV'),
  address: GNOSIS_CHAINLINK_ADDRESS,
  decimals: 18,
  permit: false,
};

const GNOSIS_USDC_ADDRESS = '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83';
export const GNOSIS_USDC_CRYPTO: Crypto = {
  id: makeCryptoId({ chainId: GNOSIS_CHAIN.id, address: GNOSIS_USDC_ADDRESS }),
  name: 'USD Coin',
  symbol: 'USDC',
  chain: GNOSIS_CHAIN,
  icon: cryptoIconS3('4syfEa'),
  address: GNOSIS_USDC_ADDRESS,
  decimals: 6,
  permit: false,
};

// Polygon

const POLYGON_USDC_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
export const POLYGON_USDC_CRYPTO: Crypto = {
  id: makeCryptoId({ chainId: POLYGON_CHAIN.id, address: POLYGON_USDC_ADDRESS }),
  name: 'USD Coin',
  symbol: 'USDC',
  chain: POLYGON_CHAIN,
  icon: cryptoIconS3('4syfEa'),
  address: POLYGON_USDC_ADDRESS,
  decimals: 6,
  permit: true,
};

// Fantom

const FANTOM_DAI_ADDRESS = '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e';
export const FANTOM_DAI_CRYPTO: Crypto = {
  id: makeCryptoId({ chainId: FANTOM_CHAIN.id, address: FANTOM_DAI_ADDRESS }),
  name: 'Dai',
  symbol: 'DAI',
  chain: FANTOM_CHAIN,
  icon: cryptoIconS3('5VbaJA'),
  address: FANTOM_DAI_ADDRESS,
  decimals: 18,
  permit: true,
};
