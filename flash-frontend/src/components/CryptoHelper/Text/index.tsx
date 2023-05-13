import { Typography } from '@mui/material';

import { FCC } from 'helpers/react';

type Props = {
  color?: string;
};

export const Text: FCC<Props> = ({ children, color }) => {
  return (
    <Typography
      variant='caption'
      color={color}
    >
      {children}
    </Typography>
  );
};
