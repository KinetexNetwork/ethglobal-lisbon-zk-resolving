import { SxProps } from '@mui/material';

export const HIDDEN_SCROLLBAR_SX: SxProps = {
  // Firefox
  scrollbarWidth: 'none',
  // Internet Explorer 10+
  msOverflowStyle: 'none',
  // WebKit
  '&::-webkit-scrollbar': {
    width: 0,
    height: 0,
  },
};

export const X_ONLY_SCROLLBAR_SX: SxProps = {
  overflowX: 'auto',
  overflowY: 'hidden',
};

export const Y_ONLY_SCROLLBAR_SX: SxProps = {
  overflowX: 'hidden',
  overflowY: 'auto',
};
