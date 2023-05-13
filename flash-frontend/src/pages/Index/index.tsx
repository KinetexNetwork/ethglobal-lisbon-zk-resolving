import { FC } from 'react';

import { Box, Stack } from '@mui/material';

import { Navbar } from 'components/Navbar';
import { SwapForm } from 'components/SwapForm';

import { csx } from 'helpers/sx';

import { useInWidth } from 'logic/layout';

import { HIDDEN_SCROLLBAR_SX, Y_ONLY_SCROLLBAR_SX } from 'theme/scrollbar';

import { SwapDialog } from '../SwapDialog';

export const Index: FC = () => {
  const compactPadding = useInWidth(600);

  return (
    <Box sx={csx({ width: '100vw', height: '100vh' }, Y_ONLY_SCROLLBAR_SX, HIDDEN_SCROLLBAR_SX)}>
      <Navbar />

      <Stack sx={{ alignItems: 'center', paddingY: compactPadding ? 3 : 8 }}>
        <SwapForm />
      </Stack>

      <SwapDialog />
    </Box>
  );
};
