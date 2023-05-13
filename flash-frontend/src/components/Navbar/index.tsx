import { FC } from 'react';

import { AppBar, Chip, Stack, Toolbar, Typography } from '@mui/material';

import KinetexLogo from 'assets/icons/KinetexLogo';

import { WalletButton } from 'components/WalletButton';

import { useInWidth } from 'logic/layout';

export const Navbar: FC = () => {
  const compact = useInWidth(460);
  const veryCompact = useInWidth(320);

  return (
    <Stack sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar sx={{ gap: 2 }}>
          <KinetexLogo fontSize='large' />

          {veryCompact ? null : (
            <Stack
              direction='row'
              gap={1}
              alignItems='center'
            >
              <Typography
                variant='h6'
                component='div'
                sx={{ flexGrow: 1 }}
              >
                {compact ? 'v2' : 'Kinetex v2'}
              </Typography>
              <Chip
                label={compact ? '🚧' : 'Proto 🚧'}
                color='primary'
                size='small'
                sx={{ mt: 2 }}
              />
            </Stack>
          )}

          <Stack flexGrow={1} />

          <WalletButton />
        </Toolbar>
      </AppBar>
    </Stack>
  );
};
