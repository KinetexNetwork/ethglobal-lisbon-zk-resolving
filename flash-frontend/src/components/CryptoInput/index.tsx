import { Amount, Crypto } from 'models';
import { FC } from 'react';

import { Paper, Stack, Typography } from '@mui/material';

import { AmountInput } from 'components/AmountInput';
import { AllowanceHelperData } from 'components/CryptoHelper/Allowance';
import { CryptoSelect } from 'components/CryptoSelect';

import { ZERO_AMOUNT, compareAmountIs, formatFiatMoney, multiplyAmount } from 'helpers/amount';
import { isNotNull, isNull } from 'helpers/null';

import { CryptoType } from 'logic/crypto';
import { useGetCryptoPrice } from 'logic/cryptoPrice';
import { useInWidth } from 'logic/layout';

type Props = {
  id: string;
  label?: string;
  crypto?: Crypto;
  cryptoType?: CryptoType;
  onCryptoSelect?: (crypto?: Crypto) => void;
  amount?: Amount;
  onAmountChange?: (amount: Amount) => void;
  readonly?: boolean;
  loading?: boolean;
  showSameCrypto?: boolean;
  allowanceHelper?: AllowanceHelperData;
};

export const CryptoInput: FC<Props> = ({
  id,
  label,
  crypto,
  cryptoType,
  onCryptoSelect,
  amount = ZERO_AMOUNT,
  onAmountChange,
  readonly,
  loading,
  showSameCrypto,
  allowanceHelper,
}) => {
  const verticalLayout = useInWidth(600);
  const compactInputs = useInWidth(300);
  const inputSx = {
    width: compactInputs ? 150 : 220,
    height: 80,
  };

  const getCryptoPrice = useGetCryptoPrice();

  const getHelperText = (): string => {
    let helperText = '';
    let amountFiat = ZERO_AMOUNT;
    if (isNotNull(crypto) && compareAmountIs(amount, 'greater', ZERO_AMOUNT)) {
      const cryptoPrice = getCryptoPrice(crypto.id);
      if (isNull(cryptoPrice)) {
        helperText = '...';
      } else {
        amountFiat = multiplyAmount(amount, cryptoPrice);
      }
    }
    if (!helperText) {
      helperText = formatFiatMoney(amountFiat, { display: 'sign' });
    }
    return helperText;
  };

  return (
    <Paper
      elevation={3}
      sx={{ paddingX: 3, paddingY: 2, borderRadius: 3 }}
    >
      <Stack gap={1}>
        {label ? <Typography fontSize={18}>{label}</Typography> : null}

        <Stack
          direction={verticalLayout ? 'column' : 'row'}
          gap={2}
        >
          <Stack sx={inputSx}>
            <AmountInput
              id={`${id}-amount-input`}
              label='Amount'
              amount={amount}
              onAmountChange={onAmountChange}
              maxDecimals={crypto?.decimals}
              helperText={getHelperText()}
              readonly={readonly}
              loading={loading}
            />
          </Stack>

          <Stack sx={inputSx}>
            <CryptoSelect
              id={`${id}-crypto-select`}
              cryptoType={cryptoType}
              selectedCrypto={crypto}
              onCryptoSelect={onCryptoSelect}
              showSameCrypto={showSameCrypto}
              allowanceHelper={allowanceHelper}
              compact={compactInputs}
            />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};
