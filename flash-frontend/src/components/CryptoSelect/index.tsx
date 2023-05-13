import { Crypto } from 'models';
import { FC, ReactNode } from 'react';

import {
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';

import { CryptoHelper } from 'components/CryptoHelper';
import { AllowanceHelperData } from 'components/CryptoHelper/Allowance';
import { CryptoIcon } from 'components/CryptoIcon';

import { isNotNull, isNull } from 'helpers/null';

import { CryptoType, useCryptos, useGetCrypto } from 'logic/crypto';

type Props = {
  id: string;
  cryptoType?: CryptoType;
  selectedCrypto?: Crypto;
  onCryptoSelect?: (crypto?: Crypto) => void;
  showSameCrypto?: boolean;
  allowanceHelper?: AllowanceHelperData;
  compact?: boolean;
};

export const CryptoSelect: FC<Props> = ({
  id,
  cryptoType,
  selectedCrypto,
  onCryptoSelect,
  showSameCrypto = false,
  allowanceHelper,
  compact = false,
}) => {
  const cryptos = useCryptos({ type: 'swap-from-or-to' });
  const getCrypto = useGetCrypto();
  const getFilteredCrypto = useGetCrypto({ type: cryptoType });

  const isCryptoDisabled = (cryptoId: string): boolean => {
    const crypto = getFilteredCrypto(cryptoId);
    const disabled = isNull(crypto);
    return disabled;
  };

  const handleChange = (event: SelectChangeEvent): void => {
    if (isNull(onCryptoSelect)) {
      return;
    }

    const cryptoId = event.target.value;
    const crypto = getCrypto(cryptoId);
    onCryptoSelect(crypto);
  };

  const renderCryptoName = (crypto: Crypto): ReactNode => {
    return (
      <Stack
        direction='row'
        gap={1}
      >
        {compact ? null : crypto.name}
        <Typography color='text.disabled'>{crypto.symbol}</Typography>
      </Stack>
    );
  };

  const renderHelper = (): ReactNode => {
    if (showSameCrypto) {
      return <CryptoHelper.Same />;
    }

    if (isNotNull(allowanceHelper)) {
      return <CryptoHelper.Allowance data={allowanceHelper} />;
    }

    return null;
  };

  const renderValue = (cryptoId: string): ReactNode => {
    const crypto = getCrypto(cryptoId);
    if (isNull(crypto)) {
      return null;
    }

    return (
      <Stack
        direction='row'
        alignItems='center'
        gap={2}
      >
        <Stack marginY={-1}>
          <CryptoIcon
            crypto={crypto}
            size={32}
          />
        </Stack>
        {renderCryptoName(crypto)}
      </Stack>
    );
  };

  return (
    <FormControl fullWidth>
      <InputLabel id={id}>Crypto</InputLabel>
      <Select
        labelId={id}
        id={id}
        value={selectedCrypto?.id ?? ''}
        label='Token'
        onChange={handleChange}
        renderValue={renderValue}
      >
        {cryptos.map((crypto) => (
          <MenuItem
            key={crypto.id}
            value={crypto.id}
            disabled={isCryptoDisabled(crypto.id)}
            sx={{ height: 48 }}
          >
            <ListItemIcon sx={{ marginRight: 1.5 }}>
              <CryptoIcon
                crypto={crypto}
                size={28}
              />
            </ListItemIcon>
            <ListItemText>{renderCryptoName(crypto)}</ListItemText>
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{renderHelper()}</FormHelperText>
    </FormControl>
  );
};
