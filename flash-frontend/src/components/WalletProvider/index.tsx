import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/react';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import * as chain from 'wagmi/chains';

import { useTheme } from '@mui/material';

import GnosisIcon from 'assets/svgIcons/Gnosis.svg';

import { isNull } from 'helpers/null';
import { FCC } from 'helpers/react';

const getProjectId = (): string => {
  const projectId = process.env.REACT_APP_WEB3_MODAL_PROJECT_ID;
  if (isNull(projectId)) {
    throw new Error('Web3Modal project ID must be provided');
  }
  return projectId;
};

const chains = [
  chain.mainnet,
  chain.bsc,
  chain.polygon,
  chain.avalanche,
  chain.arbitrum,
  chain.optimism,
  chain.fantom,
  chain.gnosis,
];

const projectId = getProjectId();
const { provider } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ chains, projectId, version: 1 }),
  provider,
});

const ethereumClient = new EthereumClient(wagmiClient, chains);

const CHAIN_IMAGES = {
  [chain.gnosis.id]: GnosisIcon,
};

// See https://explorer.walletconnect.com/?type=wallet for IDs
const ENABLED_WALLET_IDS = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
];

export const WalletProvider: FCC = ({ children }) => {
  const theme = useTheme();

  return (
    <>
      <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>

      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        enableNetworkView
        enableAccountView
        explorerExcludedWalletIds='ALL'
        explorerRecommendedWalletIds={ENABLED_WALLET_IDS}
        chainImages={CHAIN_IMAGES}
        themeMode='dark'
        themeVariables={{
          '--w3m-z-index': '99999',
          '--w3m-accent-color': theme.palette.primary.main,
          '--w3m-accent-fill-color': theme.palette.text.primary,
          '--w3m-background-color': theme.palette.primary.main,
        }}
      />
    </>
  );
};
