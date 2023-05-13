import { Chain } from 'models';
import { useCallback, useState } from 'react';

import { handleError } from 'helpers/error';

import { SwitchChainFunc, getWalletErrorDescription, useWallet } from 'logic/wallet';

type ChainSwitchData = {
  needed: boolean;
  inProgress: boolean;
  lastError: string;
  action: SwitchChainFunc;
};

export const useChainSwitchAction = (chain: Chain | undefined): ChainSwitchData => {
  const wallet = useWallet();

  const [inProgress, setInProgress] = useState(false);
  const [lastError, setLastError] = useState('');

  const needed = !wallet.isOnChain(chain?.id);
  const walletSwitchChain = wallet.switchChain;

  const action: SwitchChainFunc = useCallback(
    async (chainId) => {
      setInProgress(true);
      setLastError('');

      let error = '';
      try {
        await walletSwitchChain(chainId);
      } catch (e) {
        error = handleError(e, 'Failed to switch chain', getWalletErrorDescription(e));
      }

      setInProgress(false);
      setLastError(error);
    },
    [walletSwitchChain],
  );

  const data: ChainSwitchData = {
    needed,
    inProgress,
    lastError,
    action,
  };
  return data;
};
