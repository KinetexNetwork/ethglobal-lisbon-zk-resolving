import { Crypto } from '../models';

import { ETHEREUM_WETH_CRYPTO, GNOSIS_USDC_CRYPTO, GOERLI_WETH_CRYPTO, POLYGON_USDC_CRYPTO } from './cryptos';

const SWAP_CRYPTOS_ONLY_FROM: Set<Crypto> = new Set([]);

const SWAP_CRYPTOS_ONLY_TO: Set<Crypto> = new Set([]);

const SWAP_CRYPTOS_ALWAYS: Set<Crypto> = new Set([ETHEREUM_WETH_CRYPTO, GOERLI_WETH_CRYPTO, GNOSIS_USDC_CRYPTO]);

const DEPOSIT_CRYPTOS: Set<Crypto> = new Set([POLYGON_USDC_CRYPTO]);

export const CRYPTOS_FROM: Set<Crypto> = new Set([...SWAP_CRYPTOS_ONLY_FROM, ...SWAP_CRYPTOS_ALWAYS]);

export const CRYPTOS_TO: Set<Crypto> = new Set([...SWAP_CRYPTOS_ONLY_TO, ...SWAP_CRYPTOS_ALWAYS]);

export const CRYPTOS_FROM_TO: Set<Crypto> = new Set([...CRYPTOS_FROM, ...CRYPTOS_TO]);

export const CRYPTOS: Set<Crypto> = new Set([...CRYPTOS_FROM_TO, ...DEPOSIT_CRYPTOS]);
