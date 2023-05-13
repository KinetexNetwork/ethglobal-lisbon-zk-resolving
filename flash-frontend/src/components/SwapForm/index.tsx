import { FC } from 'react';

import { Paper, Stack } from '@mui/material';

import { BuySellForm } from 'components/BuySellForm';
import { QuotePreview } from 'components/QuotePreview';
import { SwapButton } from 'components/SwapButton';
import { SwapHeader } from 'components/SwapHeader';

import { useInWidth } from 'logic/layout';
import { useSwapQuoteLoader } from 'logic/swapQuote';

export const SwapForm: FC = () => {
  const compact = useInWidth(600);
  const veryCompact = useInWidth(300);

  useSwapQuoteLoader();

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 5,
        maxWidth: compact ? (veryCompact ? 262 : 332) : 568,
      }}
    >
      <Stack
        sx={{
          paddingX: 4,
          paddingY: 3,
          gap: 2,
        }}
      >
        <SwapHeader />
        <BuySellForm />
        <QuotePreview />
        <SwapButton />
      </Stack>
    </Paper>
  );
};
