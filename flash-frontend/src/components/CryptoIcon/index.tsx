import { Crypto } from 'models';
import { FC } from 'react';

import { BaseCryptoIcon, DEFAULT_SIZE } from 'components/BaseCryptoIcon';
import { ChainIcon } from 'components/ChainIcon';

type Props = {
  crypto?: Crypto;
  size?: number;
};

export const CryptoIcon: FC<Props> = ({ crypto, size = DEFAULT_SIZE }) => {
  const description = `${crypto?.name ?? 'Empty'} crypto icon`;
  const chainDecoratorSize = (size * 65) / 100;

  return (
    <BaseCryptoIcon
      icon={crypto?.icon}
      size={size}
      description={description}
      badge={
        <ChainIcon
          chain={crypto?.chain}
          size={chainDecoratorSize}
        />
      }
    />
  );
};
