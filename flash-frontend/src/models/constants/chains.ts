import { cryptoIconS3 } from '../cryptoIcon';
import { Chain } from '../models';

export const ETHEREUM_CHAIN: Chain = {
  id: '1',
  icon: cryptoIconS3('6kaxEc'),
  name: 'Ethereum',
};

export const GOERLI_CHAIN: Chain = {
  id: '5',
  icon: cryptoIconS3('g03rl1'),
  name: 'Goerli',
};

export const GNOSIS_CHAIN: Chain = {
  id: '100',
  icon: cryptoIconS3('32S2t6'),
  name: 'Gnosis',
};

export const POLYGON_CHAIN: Chain = {
  id: '137',
  icon: cryptoIconS3('4sXnDD'),
  name: 'Polygon',
};

export const FANTOM_CHAIN: Chain = {
  id: '250',
  icon: cryptoIconS3('2hDV2S'),
  name: 'Fantom',
};
