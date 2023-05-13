import copyToClipboard from 'copy-to-clipboard';
import { Amount, Crypto, Swap, SwapState, SwapTransaction } from 'models';
import { FC, ReactNode, useEffect, useState } from 'react';

import CopyIcon from '@mui/icons-material/ContentCopyRounded';
import LinkIcon from '@mui/icons-material/OpenInNewRounded';
import RevealIcon from '@mui/icons-material/PlayArrowRounded';

import { CryptoIcon } from 'components/CryptoIcon';
import { Detail } from 'components/Detail';

import { formatCryptoMoney, formatFiatMoney, multiplyAmount } from 'helpers/amount';
import { formatShortAddress } from 'helpers/format/address';
import { formatTimeToMinute } from 'helpers/format/time';
import { openLink } from 'helpers/link';
import { isNotNull, isNull } from 'helpers/null';
import { isoFromSec } from 'helpers/time';

import { useGetCryptoPrice } from 'logic/cryptoPrice';
import { useInWidth } from 'logic/layout';

type Props = {
  swap: Swap;
};

export const SwapDetails: FC<Props> = ({ swap }) => {
  const verticalLayout = useInWidth(600);

  const getCryptoPrice = useGetCryptoPrice();

  const showSwapTransactions = swap.state !== SwapState.AwaitingSignature;

  const [transactionsRevealed, setTransactionsRevealed] = useState(false);

  useEffect(() => {
    if (showSwapTransactions) {
      setTransactionsRevealed(false);
    }
  }, [showSwapTransactions]);

  const formatAmountFiat = (amount: Amount, crypto: Crypto): string => {
    const cryptoPrice = getCryptoPrice(crypto.id);
    if (isNull(cryptoPrice)) {
      return '...';
    }

    const amountFiat = multiplyAmount(amount, cryptoPrice);
    return formatFiatMoney(amountFiat, { display: 'sign' });
  };

  const getCryptoAmountValues = (amount: Amount, crypto: Crypto): ReactNode[] => {
    return [
      <Detail.Text
        text={formatAmountFiat(amount, crypto)}
        secondary
      />,
      <Detail.Text
        text='|'
        secondary
      />,
      <Detail.Text text={formatCryptoMoney(amount)} />,
      <CryptoIcon
        size={20}
        crypto={crypto}
      />,
    ];
  };

  const getFromCryptoValues = (): ReactNode[] => {
    return getCryptoAmountValues(swap.fromAmount, swap.fromCrypto);
  };

  const getToCryptoValues = (): ReactNode[] => {
    return getCryptoAmountValues(swap.toAmount, swap.toCrypto);
  };

  const getCollateralValues = (): ReactNode[] => {
    return getCryptoAmountValues(swap.collateralAmount, swap.collateralCrypto);
  };

  const getMarketMakerValues = (): ReactNode[] => {
    const handleCopyClick = (): void => {
      copyToClipboard(swap.marketMakerAddress);
    };

    return [
      <Detail.Text text={formatShortAddress(swap.marketMakerAddress)} />,
      <Detail.Button
        Icon={CopyIcon}
        onClick={handleCopyClick}
      />,
    ];
  };

  const getDeadlineValues = (): ReactNode[] => {
    return [<Detail.Text text={formatTimeToMinute(isoFromSec(swap.deadline))} />];
  };

  const getTxSummaryValues = (): ReactNode[] => {
    const handleRevealClick = (): void => {
      setTransactionsRevealed((revealed) => !revealed);
    };

    const totalTx = 2;
    let completedTx = 0;
    if (isNotNull(swap.userToMarketMakerTx)) {
      completedTx += 1;
    }
    if (isNotNull(swap.marketMakerToUserTx)) {
      completedTx += 1;
    }

    return [
      <Detail.Text text={`${completedTx}/${totalTx}`} />,
      <Detail.Button
        Icon={RevealIcon}
        onClick={handleRevealClick}
        sx={{
          transform: `rotate(${transactionsRevealed ? 270 : 90}deg)`,
          transition: 'transform 0.3s',
        }}
      />,
    ];
  };

  const getTxValues = (transaction?: SwapTransaction): ReactNode[] => {
    if (isNull(transaction)) {
      return [
        <Detail.Text
          text='Pending...'
          secondary
        />,
      ];
    }

    const handleLinkClick = (): void => {
      openLink(transaction.explorerUrl);
    };

    return [
      <Detail.Text
        text={formatShortAddress(transaction.txid)}
        secondary
      />,
      <Detail.Button
        Icon={LinkIcon}
        onClick={handleLinkClick}
      />,
    ];
  };

  return (
    <Detail.Container>
      <Detail.Row
        title='You sell'
        values={getFromCryptoValues()}
      />
      <Detail.Row
        title='You buy'
        values={getToCryptoValues()}
      />
      <Detail.Row
        title='Collateral'
        values={getCollateralValues()}
      />
      <Detail.Row
        title='Market maker'
        values={getMarketMakerValues()}
      />
      <Detail.Row
        title='Deadline'
        values={getDeadlineValues()}
      />
      {showSwapTransactions ? (
        <>
          <Detail.Row
            title='Transactions'
            values={getTxSummaryValues()}
          />
          {transactionsRevealed ? (
            <Detail.Container
              sx={{
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#FFFFFF16',
                paddingX: verticalLayout ? 1 : 2,
                paddingBottom: 1,
                paddingTop: verticalLayout ? 0.25 : 0,
                borderTop: 'none',
                borderRadius: 3,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
              }}
            >
              <Detail.Row
                title='1. MM receives from you'
                values={getTxValues(swap.userToMarketMakerTx)}
              />
              <Detail.Row
                title='2. MM sends to you'
                values={getTxValues(swap.marketMakerToUserTx)}
              />
            </Detail.Container>
          ) : null}
        </>
      ) : null}
    </Detail.Container>
  );
};
