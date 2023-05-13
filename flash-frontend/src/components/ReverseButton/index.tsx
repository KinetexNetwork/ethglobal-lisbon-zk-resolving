import { FC } from 'react';
import { useRecoilState } from 'recoil';

import ReverseIcon from '@mui/icons-material/SwapVerticalCircle';
import { Box, IconButton } from '@mui/material';

import { fromCryptoSelector, toCryptoSelector } from 'logic/swapParams';

export const ReverseButton: FC = () => {
  const [fromCrypto, setFromCrypto] = useRecoilState(fromCryptoSelector);
  const [toCrypto, setToCrypto] = useRecoilState(toCryptoSelector);

  const handleClick = (): void => {
    setFromCrypto(toCrypto);
    setToCrypto(fromCrypto);
  };

  return (
    <IconButton
      sx={{
        padding: 0,
        fontSize: 40,
        position: 'relative',
        zIndex: 0,
      }}
      onClick={handleClick}
    >
      <ReverseIcon
        sx={{
          fontSize: 'inherit',
          color: 'primary.light',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
          background: 'white',
          borderRadius: '50%',
          zIndex: -1,
        }}
      />
    </IconButton>
  );
};
