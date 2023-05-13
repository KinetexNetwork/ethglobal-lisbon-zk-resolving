import { FC } from 'react';

import { IconButton, IconButtonProps, SvgIcon } from '@mui/material';

import { csx } from 'helpers/sx';

type Props = IconButtonProps & {
  Icon: typeof SvgIcon;
};

export const Button: FC<Props> = ({ Icon, sx, ...props }) => {
  return (
    <IconButton
      sx={csx({ padding: 0.5, margin: -0.5, color: 'text.secondary' }, sx)}
      {...props}
    >
      <Icon sx={{ fontSize: '20px' }} />
    </IconButton>
  );
};
