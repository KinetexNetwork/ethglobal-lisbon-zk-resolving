import {
  getNetwork,
  switchNetwork,
  prepareSendTransaction as wagmiPrepareSendTransaction,
  sendTransaction as wagmiSendTransaction,
  signTypedData as wagmiSignTypedData,
} from '@wagmi/core';
import { useWeb3Modal } from '@web3modal/react';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';

import { logError } from 'helpers/error';
import { formatShortAddress } from 'helpers/format/address';

import { WalletError } from './error';
import {
  ANY_CHAIN,
  normalizeAddress,
  normalizeChainId,
  normalizeData,
  normalizeTypedData,
  normalizeValue,
} from './normalization';
import { IsOnChainFunc, SendTransactionFunc, SignTypedDataFunc, SwitchChainFunc, WalletData } from './types';

const addressesEqual = (left: string, right: string): boolean => {
  return left.toLowerCase() === right.toLowerCase();
};

const chainIdsEqual = (left: number, right: number): boolean => {
  return left === right;
};

const logWalletError = (title: string, error?: unknown): void => {
  logError(error, `Wallet - ${title}`);
};

const getCurrentChainId = (): number => {
  return getNetwork().chain?.id ?? 0;
};

export const useWallet = (): WalletData => {
  const account = useAccount();
  const web3modal = useWeb3Modal();

  const openConnect = web3modal.open;
  const isConnected = account.isConnected;
  const address = account.address ?? '';

  const isOnNormalizedChain = useCallback((chainId: number) => {
    if (chainId === ANY_CHAIN) {
      return true;
    }

    const currentChainId = getCurrentChainId();
    return chainIdsEqual(chainId, currentChainId);
  }, []);

  const isOnChain: IsOnChainFunc = useCallback(
    (chainId) => {
      return isOnNormalizedChain(normalizeChainId(chainId));
    },
    [isOnNormalizedChain],
  );

  const switchNormalizedChain = useCallback(
    async (chainId: number) => {
      if (isOnNormalizedChain(chainId)) {
        return;
      }

      try {
        await switchNetwork({ chainId });
      } catch (err) {
        logWalletError('Chain switch failed', err);
        throw new WalletError(
          `Chain switch from ${getCurrentChainId()} to ${chainId} failed. ` +
            `Try again or switch manually in the wallet`,
          err,
        );
      }
    },
    [isOnNormalizedChain],
  );

  const switchChain: SwitchChainFunc = useCallback(
    async (chainId) => {
      await switchNormalizedChain(normalizeChainId(chainId));
    },
    [switchNormalizedChain],
  );

  const ensureReadyForOperation = useCallback(
    async (from: string, chainId: number) => {
      if (!isConnected) {
        logWalletError('Not connected');
        throw new WalletError('Wallet is not connected');
      }

      if (!addressesEqual(from, address)) {
        logWalletError('Account is not active');
        throw new WalletError(
          `Wrong active wallet account: ` +
            `expected ${formatShortAddress(from, { compact: true })}, ` +
            `but got ${formatShortAddress(address, { compact: true })}. ` +
            `Switch account in the wallet and try again`,
        );
      }

      if (!isOnNormalizedChain(chainId)) {
        logWalletError('Chain is not active');
        throw new WalletError(
          `Wrong active wallet chain: ` +
            `expected ${chainId}, ` +
            `but got ${getCurrentChainId()}. ` +
            `Switch chain in the wallet and try again`,
        );
      }
    },
    [address, isConnected, isOnNormalizedChain],
  );

  const sendTransaction: SendTransactionFunc = useCallback(
    async (params) => {
      const chainId = normalizeChainId(params.chainId);
      const from = normalizeAddress(params.from);
      const to = normalizeAddress(params.to);
      const value = await normalizeValue(params.value);
      const data = normalizeData(params.data);

      await ensureReadyForOperation(from, chainId);

      try {
        const preparedArgs = await wagmiPrepareSendTransaction({
          request: {
            chainId,
            from,
            to,
            value,
            data,
          },
        });
        await wagmiSendTransaction(preparedArgs);
      } catch (err) {
        logWalletError('Transaction send error:', err);
        throw new WalletError('Send transaction operation was rejected in the wallet or failed', err);
      }
    },
    [ensureReadyForOperation],
  );

  const signTypedData: SignTypedDataFunc = useCallback(
    async (params) => {
      const chainId = normalizeChainId(params.chainId);
      const from = normalizeAddress(params.from);
      const data = normalizeTypedData(params.data);

      await ensureReadyForOperation(from, chainId);

      try {
        return await wagmiSignTypedData(data);
      } catch (err) {
        logWalletError('Sign typed data error:', err);
        throw new WalletError('Sign typed data operation was rejected in the wallet or failed', err);
      }
    },
    [ensureReadyForOperation],
  );

  const data: WalletData = {
    isConnected,
    openConnect,
    isOnChain,
    switchChain,
    address,
    sendTransaction,
    signTypedData,
  };
  return data;
};
