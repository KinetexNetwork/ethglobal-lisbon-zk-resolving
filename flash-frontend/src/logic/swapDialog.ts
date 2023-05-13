import { Swap } from 'models';
import { useCallback } from 'react';
import { DefaultValue, atom, selector, useSetRecoilState } from 'recoil';

import { getApiErrorDescription } from 'api/error';
import { ConfirmSwapV2, confirmSwapV2 } from 'api/gen/v2';

import { handleError } from 'helpers/error';

import { swapSelector } from 'logic/swapProcess';
import { SignTypedDataParams, getWalletErrorDescription, useWallet } from 'logic/wallet';

const ns = (key: string): string => {
  return `swapDialog/${key}`;
};

const swapDialogOpenAtom = atom<boolean>({
  key: ns('swapDialogOpenAtom'),
  default: false,
});

export const swapDialogOpenSelector = selector<boolean>({
  key: ns('swapDialogOpenSelector'),
  get: ({ get }) => get(swapDialogOpenAtom),
  set: ({ set }, newValue) => {
    set(swapDialogOpenAtom, newValue);
    if (newValue instanceof DefaultValue || !newValue) {
      set(swapSelector, undefined);
      set(swapConfirmLoadingSelector, false);
      set(swapConfirmErrorSelector, '');
      set(swapConfirmedSelector, false);
    }
  },
});

export type SwapDialogOpener = () => void;

export const useOpenSwapDialog = (): SwapDialogOpener => {
  const setOpen = useSetRecoilState(swapDialogOpenSelector);

  const openDialog: SwapDialogOpener = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  return openDialog;
};

export const swapConfirmLoadingSelector = atom<boolean>({
  key: ns('swapConfirmLoadingSelector'),
  default: false,
});

export const swapConfirmErrorSelector = atom<string>({
  key: ns('swapConfirmErrorSelector'),
  default: '',
});

export const swapConfirmedSelector = atom<boolean>({
  key: ns('swapConfirmedSelector'),
  default: false,
});

export type SwapConfirmer = (swap: Swap) => void;

export const useConfirmSwap = (): SwapConfirmer => {
  const wallet = useWallet();

  const setSwapConfirmLoading = useSetRecoilState(swapConfirmLoadingSelector);
  const setSwapConfirmError = useSetRecoilState(swapConfirmErrorSelector);
  const setSwapConfirmed = useSetRecoilState(swapConfirmedSelector);

  const confirmSwap: SwapConfirmer = async (swap) => {
    setSwapConfirmLoading(true);
    setSwapConfirmError('');

    let error = '';

    let swapSignature = '';
    {
      const signSwapParams: SignTypedDataParams = {
        from: wallet.address,
        data: swap.orderData,
      };

      try {
        swapSignature = await wallet.signTypedData(signSwapParams);
      } catch (e) {
        error = handleError(e, 'Failed to sign swap', getWalletErrorDescription(e));
      }
    }

    if (swapSignature) {
      const confirmSwapData: ConfirmSwapV2 = {
        signature: swapSignature,
      };

      try {
        await confirmSwapV2(swap.hash, confirmSwapData);
        setSwapConfirmed(true);
      } catch (e) {
        error = handleError(e, 'Failed to confirm swap', getApiErrorDescription(e));
      }
    }

    setSwapConfirmLoading(false);
    setSwapConfirmError(error);
  };

  return confirmSwap;
};
