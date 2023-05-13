import { FC, Fragment, ReactNode } from 'react';

import { Divider, Stack, SxProps, Typography, useTheme } from '@mui/material';

import { csx } from 'helpers/sx';

import { useInWidth } from 'logic/layout';

import { HIDDEN_SCROLLBAR_SX, X_ONLY_SCROLLBAR_SX } from 'theme/scrollbar';

type Props = {
  title: string;
  values?: ReactNode[];
};

export const Row: FC<Props> = ({ title, values = [] }) => {
  const theme = useTheme();
  const verticalLayout = useInWidth(600);

  let containerSx: SxProps | undefined;
  if (verticalLayout) {
    containerSx = csx(
      {
        paddingX: 1.25,
        paddingY: 0.75,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.palette.divider,
        borderRadius: 2,
      },
      X_ONLY_SCROLLBAR_SX,
      HIDDEN_SCROLLBAR_SX,
    );
  }

  return (
    <Stack
      direction={verticalLayout ? 'column' : 'row'}
      alignItems={verticalLayout ? undefined : 'center'}
      gap={verticalLayout ? 0.25 : 2}
      sx={containerSx}
    >
      <Typography
        variant='body2'
        color='text.secondary'
      >
        {title}
      </Typography>
      {verticalLayout ? null : <Divider sx={{ flexGrow: 1 }} />}
      <Stack
        direction='row'
        gap={1}
        alignItems='center'
      >
        {values.map((item, index) => (
          <Fragment key={index}>{item}</Fragment>
        ))}
      </Stack>
    </Stack>
  );
};
