import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import RefreshIcon from '@mui/icons-material/Cached';
import { IconButton } from '@mui/material';

import { isNull } from 'helpers/null';

import { quoteSelector, useReloadSwapQuote } from 'logic/swapQuote';

export const SwapRefreshButton: FC = () => {
  const quote = useRecoilValue(quoteSelector);
  const reloadQuote = useReloadSwapQuote();

  const handleClick = (): void => {
    reloadQuote();
  };

  return (
    <IconButton
      onClick={handleClick}
      disabled={isNull(quote)}
    >
      <RefreshIcon />
    </IconButton>
  );
};
