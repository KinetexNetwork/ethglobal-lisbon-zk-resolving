import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import { FC } from 'react';
import { RecoilRoot } from 'recoil';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { WalletProvider } from 'components/WalletProvider';

import { Index } from 'pages/Index';

import { DARK_THEME } from 'theme';

dayjs.extend(relativeTime);
dayjs.extend(utc);

const queryClient = new QueryClient();

export const App: FC = () => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={DARK_THEME}>
          <CssBaseline />
          <WalletProvider>
            <Index />
          </WalletProvider>
        </ThemeProvider>

        <ReactQueryDevtools
          initialIsOpen={false}
          position='bottom-right'
        />
      </QueryClientProvider>
    </RecoilRoot>
  );
};
