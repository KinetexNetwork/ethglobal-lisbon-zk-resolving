import { Chain } from 'models';
import { FC } from 'react';

import { BaseCryptoIcon } from 'components/BaseCryptoIcon';

type Props = {
  chain?: Chain;
  size?: number;
};

export const ChainIcon: FC<Props> = ({ chain, size }) => {
  const description = `${chain?.name ?? 'Empty'} chain icon`;

  return (
    <BaseCryptoIcon
      icon={chain?.icon}
      size={size}
      description={description}
    />
  );
};
