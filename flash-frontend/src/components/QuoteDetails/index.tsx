import copyToClipboard from 'copy-to-clipboard';
import { Quote } from 'models';
import { FC, ReactNode } from 'react';

import CopyIcon from '@mui/icons-material/ContentCopyRounded';
import { Paper } from '@mui/material';

import { CryptoIcon } from 'components/CryptoIcon';
import { Detail } from 'components/Detail';

import { formatCryptoMoney, formatFiatMoney, multiplyAmount } from 'helpers/amount';
import { formatShortAddress } from 'helpers/format/address';
import { formatTimePeriod } from 'helpers/format/time';
import { isNull } from 'helpers/null';
import { useNowSec } from 'helpers/time';

import { useGetCryptoPrice } from 'logic/cryptoPrice';

const DeadlineText: FC<{ deadline: number }> = ({ deadline }) => {
  const nowSec = useNowSec();
  const secLeft = deadline - nowSec;

  return (
    <Detail.Text
      text={formatTimePeriod(secLeft)}
      secondary
    />
  );
};

type Props = {
  quote: Quote;
};

export const QuoteDetails: FC<Props> = ({ quote }) => {
  const getCryptoPrice = useGetCryptoPrice();

  const getCollateralAmountFiat = (): string => {
    const collateralCryptoPrice = getCryptoPrice(quote.collateralCrypto.id);
    if (isNull(collateralCryptoPrice)) {
      return '...';
    }

    const collateralAmountFiat = multiplyAmount(quote.collateralAmount, collateralCryptoPrice);
    return formatFiatMoney(collateralAmountFiat, { display: 'sign' });
  };

  const getCollateralValues = (): ReactNode[] => {
    return [
      <Detail.Text
        text={getCollateralAmountFiat()}
        secondary
      />,
      <Detail.Text
        text='|'
        secondary
      />,
      <Detail.Text text={formatCryptoMoney(quote.collateralAmount)} />,
      <CryptoIcon
        size={20}
        crypto={quote.collateralCrypto}
      />,
    ];
  };

  const getMarketMakerValues = (): ReactNode[] => {
    const handleCopyClick = (): void => {
      copyToClipboard(quote.marketMakerAddress);
    };

    return [
      <Detail.Text text={formatShortAddress(quote.marketMakerAddress)} />,
      <Detail.Button
        Icon={CopyIcon}
        onClick={handleCopyClick}
      />,
    ];
  };

  const getEstimatedTimeValues = (): ReactNode[] => {
    return [
      <Detail.Text text={formatTimePeriod(quote.timeEstimate)} />,
      <Detail.Text
        text='|'
        secondary
      />,
      <DeadlineText deadline={quote.deadline} />,
    ];
  };

  return (
    <Paper
      elevation={5}
      sx={{ paddingX: 3, paddingY: 2, borderRadius: 3 }}
    >
      <Detail.Container title='Quote details'>
        <Detail.Row
          title='Collateral'
          values={getCollateralValues()}
        />
        <Detail.Row
          title='Market maker'
          values={getMarketMakerValues()}
        />
        <Detail.Row
          title='Estimated time'
          values={getEstimatedTimeValues()}
        />
      </Detail.Container>
    </Paper>
  );
};
