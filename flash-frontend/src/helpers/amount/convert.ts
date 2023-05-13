import { Amount } from 'models';

import { isNull } from 'helpers/null';

import { formatDecimal } from './formatDecimal';
import { ZERO_AMOUNT } from './math';

const DECIMAL_PATTERN = /^([0-9]*)(\.([0-9]*))?$/;
const LEADING_ZEROS_PATTERN = /^(0+)(.+)$/;

export const isDecimalAmount = (decimal: string): boolean => {
  const decimalMatch = decimal.match(DECIMAL_PATTERN);
  return !isNull(decimalMatch);
};

export const decimalToAmount = (decimal: string): Amount => {
  const decimalMatch = decimal.match(DECIMAL_PATTERN);
  if (isNull(decimalMatch)) {
    return ZERO_AMOUNT;
  }

  const int = decimalMatch[1] || '0';
  const dec = decimalMatch[3] || '';

  let v = int + dec;
  const leadingZerosMatch = v.match(LEADING_ZEROS_PATTERN);
  if (!isNull(leadingZerosMatch)) {
    v = leadingZerosMatch[2];
  }

  return { v, d: dec.length };
};

export const amountToDecimal = (amount: Amount): string => {
  return formatDecimal(amount.v, amount.d, amount.d);
};
