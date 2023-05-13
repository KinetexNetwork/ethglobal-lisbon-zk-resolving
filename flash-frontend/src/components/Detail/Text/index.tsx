import { FC } from 'react';

import { Stack, Typography } from '@mui/material';

type Props = {
  text: string;
  secondary?: boolean;
};

export const Text: FC<Props> = ({ text, secondary = false }) => {
  return (
    <Stack>
      <Typography
        variant='body2'
        variantMapping={{ body2: 'span' }}
        color={secondary ? 'text.secondary' : undefined}
        noWrap
      >
        {text}
      </Typography>
    </Stack>
  );
};
