import { Stack, SxProps, Typography } from '@mui/material';

import { FCC } from 'helpers/react';

import { useInWidth } from 'logic/layout';

type Props = {
  title?: string;
  sx?: SxProps;
};

export const Container: FCC<Props> = ({ title, sx, children }) => {
  const verticalLayout = useInWidth(600);

  return (
    <Stack
      gap={1}
      sx={sx}
    >
      {title ? (
        <Typography
          variant='body1'
          fontWeight={500}
        >
          {title}
        </Typography>
      ) : null}

      <Stack gap={verticalLayout ? 0.75 : 1}>{children}</Stack>
    </Stack>
  );
};
