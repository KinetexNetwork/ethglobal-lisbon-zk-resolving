import { FC, ReactNode } from 'react';

import { Avatar, Badge } from '@mui/material';

import { cryptoIcon } from 'helpers/crypto';

export const DEFAULT_SIZE = 24;

type Props = {
  icon?: string;
  size?: number;
  description?: string;
  badge?: ReactNode;
};

export const BaseCryptoIcon: FC<Props> = ({ icon, size = DEFAULT_SIZE, description, badge }) => {
  return (
    <Badge
      overlap='circular'
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={badge}
    >
      <Avatar
        src={cryptoIcon(icon)}
        sx={{ width: size, height: size }}
        imgProps={{ width: '100%', height: '100%', loading: 'eager', title: description }}
        alt={description}
      />
    </Badge>
  );
};
