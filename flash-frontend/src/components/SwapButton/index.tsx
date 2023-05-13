import { FC, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { LoadingButton } from '@mui/lab';
import { Stack, Typography } from '@mui/material';

import { isNotNull, isNull } from 'helpers/null';

import { useChainSwitchAction } from 'logic/chainSwitch';
import { useInWidth } from 'logic/layout';
import { useSwapAllowanceUpdater } from 'logic/swapAllowance';
import { useOpenSwapDialog } from 'logic/swapDialog';
import { swapCreateErrorSelector, swapCreateLoadingSelector, swapSelector, useCreateSwap } from 'logic/swapProcess';
import { quoteErrorSelector, quoteLoadingSelector, quoteSelector, useReloadSwapQuote } from 'logic/swapQuote';
import { useWalletConnectAction } from 'logic/walletConnect';

export const SwapButton: FC = () => {
  const compactText = useInWidth(400);

  const quoteLoading = useRecoilValue(quoteLoadingSelector);
  const quoteError = useRecoilValue(quoteErrorSelector);
  const quote = useRecoilValue(quoteSelector);

  const allowance = useSwapAllowanceUpdater(quote);
  const resetPermit = allowance.resetPermit;

  const swapCreateLoading = useRecoilValue(swapCreateLoadingSelector);
  const swapCreateError = useRecoilValue(swapCreateErrorSelector);
  const swap = useRecoilValue(swapSelector);
  const swapHash = swap?.hash;

  const createSwap = useCreateSwap();
  const openSwapDialog = useOpenSwapDialog();
  const reloadQuote = useReloadSwapQuote();

  useEffect(() => {
    if (isNotNull(swapHash)) {
      openSwapDialog();
      reloadQuote();
      resetPermit();
    }
  }, [openSwapDialog, swapHash, reloadQuote, resetPermit]);

  const walletConnect = useWalletConnectAction();
  const swapChain = quote?.fromCrypto?.chain;
  const chainSwitch = useChainSwitchAction(swapChain);
  const needsApprove = allowance.shouldProvide;

  const loading =
    quoteLoading ||
    chainSwitch.inProgress ||
    allowance.loading ||
    allowance.inProgress ||
    allowance.waitingApprove ||
    swapCreateLoading;
  const error = quoteError || chainSwitch.lastError || allowance.lastError || swapCreateError;
  const disabled = isNull(quote);

  const inWalletSuffix = (): string => {
    return ' in wallet...';
  };

  const getChainSwitchContent = (inProgress: boolean): string => {
    let content = 'Switch chain';
    if (!compactText && isNotNull(swapChain)) {
      content += ` to ${swapChain.name}`;
    }
    if (inProgress) {
      content += inWalletSuffix();
    }
    return content;
  };

  const getApproveContent = (waitingApprove: boolean, inProgress: boolean): string => {
    if (waitingApprove) {
      return 'Waiting for approve transaction...';
    }

    const getAction = (): string => {
      switch (allowance.actionType) {
        case 'approve':
          return 'Approve';
        case 'permit':
          return 'Permit';
      }
    };

    const getTarget = (): string => {
      switch (allowance.actionTarget) {
        case 'xswap':
          return 'Kinetex v2';
        case 'permit2':
          return 'Permit2';
      }
    };

    const symbol = quote?.fromCrypto?.symbol ?? 'crypto';
    let content = `${getAction()} ${symbol}`;
    if (!compactText) {
      content += ` for ${getTarget()}`;
    }
    if (inProgress) {
      content += inWalletSuffix();
    }
    return content;
  };

  let content = 'Swap';
  const loadingNoInfo = loading && !chainSwitch.inProgress && !allowance.inProgress;
  if (!disabled && !loadingNoInfo) {
    if (walletConnect.needed) {
      content = 'Connect wallet';
    } else if (chainSwitch.needed) {
      content = getChainSwitchContent(chainSwitch.inProgress);
    } else if (needsApprove) {
      content = getApproveContent(allowance.waitingApprove, allowance.inProgress);
    }
  }

  const handleConnectClick = (): void => {
    walletConnect.action();
  };

  const handleChainSwitchClick = (): void => {
    chainSwitch.action(swapChain?.id);
  };

  const handleApproveClick = (): void => {
    allowance.provideAction();
  };

  const handleSwapClick = (): void => {
    if (isNotNull(quote)) {
      createSwap(quote, walletConnect.address);
    }
  };

  const handleClick = (): void => {
    if (walletConnect.needed) {
      handleConnectClick();
    } else if (chainSwitch.needed) {
      handleChainSwitchClick();
    } else if (needsApprove) {
      handleApproveClick();
    } else {
      handleSwapClick();
    }
  };

  return (
    <>
      {error ? (
        <Stack alignItems='center'>
          <Typography
            variant='body2'
            color='error'
            textAlign='center'
            width={compactText ? '100%' : '80%'}
            sx={{ paddingX: 2 }}
          >
            {error}
          </Typography>
        </Stack>
      ) : null}

      <LoadingButton
        size='large'
        variant='contained'
        sx={{ height: 56 }}
        loading={loading}
        startIcon={<></>}
        loadingPosition='start'
        disabled={disabled}
        onClick={handleClick}
        fullWidth
      >
        {content}
      </LoadingButton>
    </>
  );
};
