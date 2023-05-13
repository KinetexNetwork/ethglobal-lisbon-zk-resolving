import { SwapState } from 'models';
import { FC, ReactNode } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CancelledIcon from '@mui/icons-material/Cancel';
import CompletedIcon from '@mui/icons-material/CheckCircle';
import WithdrawIcon from '@mui/icons-material/Paid';
import ChainIcon from '@mui/icons-material/WidgetsOutlined';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';

import { SwapDetails } from 'components/SwapDetails';

import { isNull } from 'helpers/null';

import { useChainSwitchAction } from 'logic/chainSwitch';
import { useInWidth } from 'logic/layout';
import {
  swapConfirmErrorSelector,
  swapConfirmLoadingSelector,
  swapConfirmedSelector,
  swapDialogOpenSelector,
  useConfirmSwap,
} from 'logic/swapDialog';
import { swapSelector, useSwapUpdater } from 'logic/swapProcess';
import { useWalletConnectAction } from 'logic/walletConnect';

const SwapUpdater: FC = () => {
  useSwapUpdater();
  return null;
};

export const SwapDialog: FC = () => {
  const compact = useInWidth(600);
  const veryCompact = useInWidth(300);

  const [open, setOpen] = useRecoilState(swapDialogOpenSelector);
  const swap = useRecoilValue(swapSelector);
  const swapConfirmLoading = useRecoilValue(swapConfirmLoadingSelector);
  const swapConfirmError = useRecoilValue(swapConfirmErrorSelector);
  const swapConfirmed = useRecoilValue(swapConfirmedSelector);
  const confirmSwap = useConfirmSwap();

  const walletConnect = useWalletConnectAction();
  const swapChain = swap?.fromCrypto?.chain;
  const chainSwitch = useChainSwitchAction(swapChain);

  if (isNull(swap)) {
    return null;
  }

  const withdrawHidden = swap.state !== SwapState.CancelledAwaitingWithdraw;
  const confirmError = chainSwitch.lastError || swapConfirmError;
  const confirmHidden = swapConfirmed;
  const confirmLoading = chainSwitch.inProgress || swapConfirmLoading;

  const getStateContent = (): [icon: ReactNode, description: string, color: string | undefined] => {
    if (!swapConfirmed) {
      return [null, 'Review swap details and confirm execution', undefined];
    }

    const progressIcon = (): ReactNode => {
      return (
        <CircularProgress
          size={18}
          sx={{
            marginRight: 0.25,
            flexShrink: 0,
          }}
        />
      );
    };

    type Icon = typeof SvgIcon;
    type IconProps = Parameters<Icon>[0];
    const customIcon = (Icon: Icon, color: IconProps['color']): ReactNode => {
      return (
        <Icon
          sx={{ width: 20, height: 20 }}
          color={color}
        />
      );
    };

    switch (swap.state) {
      case SwapState.AwaitingSignature:
        return [progressIcon(), 'Swap confirming...', undefined];
      case SwapState.AwaitingTransactions:
        return [progressIcon(), 'Swap transactions pending...', undefined];
      case SwapState.CancelledNoWithdraw:
        return [customIcon(CancelledIcon, 'warning'), 'Swap cancelled, no funds taken', undefined];
      case SwapState.CancelledAwaitingWithdraw:
        return [customIcon(WithdrawIcon, 'warning'), 'Swap cancelled, please withdraw', 'warning.main'];
      case SwapState.CancelledWithdrawn:
        return [customIcon(CancelledIcon, 'warning'), 'Swap cancelled & withdrawn', undefined];
      case SwapState.Completed:
        return [customIcon(CompletedIcon, 'success'), 'Swap completed!', 'success.main'];
    }
  };

  const renderState = (): ReactNode => {
    const [icon, description, color] = getStateContent();
    return (
      <Stack
        direction='row'
        alignItems='center'
        gap={1}
        marginTop={1}
      >
        {icon}
        <DialogContentText color={color}>{description}</DialogContentText>
      </Stack>
    );
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleConnectClick = (): void => {
    walletConnect.action();
  };

  const handleChainSwitchClick = (): void => {
    chainSwitch.action(swapChain?.id);
  };

  const handleConfirmSwapClick = (): void => {
    confirmSwap(swap);
  };

  const handleConfirmClick = (): void => {
    if (walletConnect.needed) {
      handleConnectClick();
    } else if (chainSwitch.needed) {
      handleChainSwitchClick();
    } else {
      handleConfirmSwapClick();
    }
  };

  const renderConfirmContent = (): string => {
    let content = 'Confirm';
    if (walletConnect.needed) {
      content = 'Connect';
    } else if (chainSwitch.needed) {
      content = 'Switch';
    }
    return content;
  };

  const renderConfirmEndIcon = (): ReactNode => {
    let icon: ReactNode = null;
    if (walletConnect.needed) {
      icon = <WalletIcon />;
    } else if (chainSwitch.needed) {
      icon = <ChainIcon />;
    }
    return icon;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={veryCompact}
    >
      <SwapUpdater />

      <DialogTitle>
        Swap {swap.fromCrypto.symbol} to {swap.toCrypto.symbol}
        {renderState()}
      </DialogTitle>

      <DialogContent sx={compact ? undefined : { minWidth: 480 }}>
        <Stack sx={{ paddingX: compact ? 0 : 2 }}>
          <SwapDetails swap={swap} />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Stack
          gap={1}
          width='100%'
        >
          {confirmError ? (
            <Typography
              variant='body2'
              color='error'
              textAlign='center'
              sx={{
                alignSelf: 'center',
                maxWidth: 420,
                paddingX: 3,
                paddingBottom: veryCompact ? 0.5 : 0,
              }}
            >
              {confirmError}
            </Typography>
          ) : null}

          <Stack
            gap={1}
            direction={veryCompact ? 'column' : 'row'}
            alignSelf={veryCompact ? 'center' : 'end'}
          >
            {withdrawHidden ? null : (
              <Button
                variant='contained'
                disabled
              >
                Withdraw
              </Button>
            )}

            {confirmHidden ? null : (
              <LoadingButton
                variant='contained'
                onClick={handleConfirmClick}
                loading={confirmLoading}
                startIcon={<></>}
                endIcon={renderConfirmEndIcon()}
                loadingPosition='start'
                sx={{ width: 140 }}
              >
                {renderConfirmContent()}
              </LoadingButton>
            )}

            {veryCompact ? <Button onClick={handleClose}>Close</Button> : null}
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
