import { FC } from 'react';

import { Stack, Typography } from '@mui/material';

import { SwapRefreshButton } from 'components/SwapRefreshButton';

export const SwapHeader: FC = () => {
  return (
    <Stack
      direction='row'
      justifyContent='space-between'
    >
      <Typography
        variant='h6'
        mt={0.5}
      >
        Swap
      </Typography>

      <SwapRefreshButton />
    </Stack>
  );
};
