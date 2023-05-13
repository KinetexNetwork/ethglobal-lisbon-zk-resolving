import { Amount } from 'models';
import { ChangeEvent, FC, useEffect, useState } from 'react';

import { FormControl, FormHelperText, InputLabel, OutlinedInput } from '@mui/material';

import { ZERO_AMOUNT, amountToDecimal, compareAmountIs, decimalToAmount, isDecimalAmount } from 'helpers/amount';
import { isNull } from 'helpers/null';

const normalizeInputValue = (value: string): string => {
  const normalizedValue = value
    // Normalize decimal separator
    .replace(',', '.')
    // Trim leading zero
    .replace(/^0(?=\d)/g, '');
  return normalizedValue;
};

type Props = {
  id: string;
  label?: string;
  readonly?: boolean;
  maxDecimals?: number;
  amount?: Amount;
  onAmountChange?: (amount: Amount) => void;
  helperText?: string;
  loading?: boolean;
};

export const AmountInput: FC<Props> = ({
  id,
  label,
  readonly = false,
  maxDecimals,
  amount = ZERO_AMOUNT,
  onAmountChange,
  helperText = '',
  loading = false,
}) => {
  const [value, setValue] = useState('0');
  const [decimals, setDecimals] = useState(0);

  const helperId = `${id}-helper`;

  let error = '';
  const decimalsExceeded = !isNull(maxDecimals) && decimals > maxDecimals;
  if (decimalsExceeded) {
    error = `${decimals}/${maxDecimals} decimals`;
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const newValue = normalizeInputValue(event.target.value);
    const isValid = isDecimalAmount(newValue);
    if (!isValid) {
      return;
    }

    setValue(newValue);
    const newAmount = decimalToAmount(newValue);
    setDecimals(newAmount.d);
    onAmountChange?.(newAmount);
  };

  useEffect(() => {
    setValue((value) => {
      const valueAmount = decimalToAmount(value);
      const same = compareAmountIs(amount, 'equal', valueAmount);
      return same ? value : amountToDecimal(amount);
    });
  }, [amount]);

  return (
    <FormControl error={!!error}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        id={id}
        label={label}
        value={loading ? '...' : value}
        onChange={handleChange}
        readOnly={readonly}
        disabled={readonly}
        inputProps={{
          type: 'text',
          inputMode: 'decimal',
          autoComplete: 'off',
          autoCorrect: 'off',
          spellCheck: 'false',
        }}
        aria-describedby={helperId}
      />
      {loading ? null : <FormHelperText id={helperId}>{error || helperText}</FormHelperText>}
    </FormControl>
  );
};
