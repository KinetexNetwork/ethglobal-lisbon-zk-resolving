import { Amount } from 'models';

import { formatDecimal } from './formatDecimal';
import {
  MoneyApproximation,
  MoneyChange,
  MoneySign,
  MoneySymbol,
  formatApproximation,
  formatMoneyChange,
  formatSign,
  formatSymbol,
} from './formatDecorators';
import { ZERO_AMOUNT, compareAmount } from './math';

type ValueFormat = {
  divDecimals?: number;
  maxDecimals: number;
  suffix?: string;
};

type AmountFormat = {
  value: string | ValueFormat;
};

type AmountFormatWithThreshold = AmountFormat & {
  threshold: Amount;
  thresholdWithEquals?: boolean;
};

type AmountSpec = {
  formats: AmountFormatWithThreshold[];
  overflowFormat: AmountFormat;
};

const CRYPTO_AMOUNT_SPEC: AmountSpec = {
  formats: [
    { threshold: ZERO_AMOUNT, thresholdWithEquals: true, value: '0' },
    { threshold: { v: '1', d: 6 }, value: '<0.000001' },
    { threshold: { v: '1', d: -2 }, value: { maxDecimals: 6 } },
    { threshold: { v: '1', d: -5 }, value: { maxDecimals: 3 } },
    { threshold: { v: '1', d: -8 }, value: { divDecimals: 3, maxDecimals: 3, suffix: 'k' } }, // Thousand
    { threshold: { v: '1', d: -11 }, value: { divDecimals: 6, maxDecimals: 3, suffix: 'M' } }, // Million
    { threshold: { v: '1', d: -14 }, value: { divDecimals: 9, maxDecimals: 3, suffix: 'B' } }, // Billion
    { threshold: { v: '1', d: -17 }, value: { divDecimals: 12, maxDecimals: 3, suffix: 'T' } }, // Trillion
    { threshold: { v: '1', d: -20 }, value: { divDecimals: 15, maxDecimals: 3, suffix: 'Qd' } }, // Quadrillion
    { threshold: { v: '1', d: -23 }, value: { divDecimals: 18, maxDecimals: 3, suffix: 'Qn' } }, // Quintillion
    { threshold: { v: '1', d: -26 }, value: { divDecimals: 21, maxDecimals: 3, suffix: 'Sx' } }, // Sextillion
    { threshold: { v: '1', d: -29 }, value: { divDecimals: 24, maxDecimals: 3, suffix: 'Sp' } }, // Septillion
    { threshold: { v: '1', d: -32 }, value: { divDecimals: 27, maxDecimals: 3, suffix: 'Oc' } }, // Octillion
    { threshold: { v: '1', d: -35 }, value: { divDecimals: 30, maxDecimals: 3, suffix: 'No' } }, // Nonillion
  ],
  overflowFormat: { value: '∞' },
};

const FIAT_AMOUNT_SPEC: AmountSpec = {
  formats: [
    { threshold: ZERO_AMOUNT, thresholdWithEquals: true, value: '0' },
    { threshold: { v: '1', d: 2 }, value: '<0.01' },
    { threshold: { v: '1', d: -5 }, value: { maxDecimals: 2 } },
    { threshold: { v: '1', d: -8 }, value: { divDecimals: 3, maxDecimals: 3, suffix: 'k' } }, // Thousand
    { threshold: { v: '1', d: -11 }, value: { divDecimals: 6, maxDecimals: 3, suffix: 'M' } }, // Million
    { threshold: { v: '1', d: -14 }, value: { divDecimals: 9, maxDecimals: 3, suffix: 'B' } }, // Billion
    { threshold: { v: '1', d: -17 }, value: { divDecimals: 12, maxDecimals: 3, suffix: 'T' } }, // Trillion
    { threshold: { v: '1', d: -20 }, value: { divDecimals: 15, maxDecimals: 3, suffix: 'Qd' } }, // Quadrillion
    { threshold: { v: '1', d: -23 }, value: { divDecimals: 18, maxDecimals: 3, suffix: 'Qn' } }, // Quintillion
    { threshold: { v: '1', d: -26 }, value: { divDecimals: 21, maxDecimals: 3, suffix: 'Sx' } }, // Sextillion
    { threshold: { v: '1', d: -29 }, value: { divDecimals: 24, maxDecimals: 3, suffix: 'Sp' } }, // Septillion
    { threshold: { v: '1', d: -32 }, value: { divDecimals: 27, maxDecimals: 3, suffix: 'Oc' } }, // Octillion
    { threshold: { v: '1', d: -35 }, value: { divDecimals: 30, maxDecimals: 3, suffix: 'No' } }, // Nonillion
  ],
  overflowFormat: { value: '∞' },
};

const formatAmountWith = (amount: Amount, format: AmountFormat): string => {
  if (typeof format.value === 'string') {
    return format.value;
  }

  const valueDecimals = amount.d + (format.value.divDecimals ?? 0);
  const decimalString = formatDecimal(amount.v, valueDecimals, format.value.maxDecimals);
  return decimalString + (format.value.suffix ?? '');
};

const formatAmount = (amount: Amount, spec: AmountSpec): string => {
  for (const format of spec.formats) {
    const compareResult = compareAmount(amount, format.threshold);
    if (compareResult === 'less' || (format.thresholdWithEquals && compareResult === 'equal')) {
      return formatAmountWith(amount, format);
    }
  }
  return formatAmountWith(amount, spec.overflowFormat);
};

type CryptoMoneyFormat = {
  change?: MoneyChange;
  approximation?: MoneyApproximation;
  symbol?: MoneySymbol;
};

/**
 * Formats decimal amount as crypto money.
 * The result string will contain approximately a fixed amount of chars.
 * This is achieved by restricting the max number of decimals displayed
 * and special large amount suffixes (like 'k', 'M', 'B', etc).
 */
export const formatCryptoMoney = (amount: Amount, format?: CryptoMoneyFormat): string => {
  const f =
    formatMoneyChange(format?.change) +
    formatApproximation(format?.approximation) +
    formatAmount(amount, CRYPTO_AMOUNT_SPEC) +
    formatSymbol(format?.symbol);
  return f;
};

type FiatDisplay = 'sign' | 'symbol';

type FiatMoneyFormat = {
  change?: MoneyChange;
  approximation?: MoneyApproximation;
  display?: FiatDisplay;
};

const FIAT_SIGN: MoneySign = '$';
const FIAT_SYMBOL: MoneySymbol = 'USD';

/**
 * Formats decimal amount as fiat money.
 * The result string will contain approximately a fixed amount of chars.
 * This is achieved by restricting the max number of decimals displayed
 * and special large amount suffixes (like 'k', 'M', 'B', etc).
 */
export const formatFiatMoney = (amount: Amount, format?: FiatMoneyFormat): string => {
  const f =
    formatMoneyChange(format?.change) +
    formatApproximation(format?.approximation) +
    formatSign(format?.display === 'sign' ? FIAT_SIGN : undefined) +
    formatAmount(amount, FIAT_AMOUNT_SPEC) +
    formatSymbol(format?.display === 'symbol' ? FIAT_SYMBOL : undefined);
  return f;
};
