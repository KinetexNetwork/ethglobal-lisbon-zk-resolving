import { APPROXIMATE_MINI_SIGN, APPROXIMATE_SIGN, GLUE_SPACE } from 'helpers/format/chars';

export type MoneyChange = 'in' | 'out' | 'in-out';

export const formatMoneyChange = (change?: MoneyChange): string => {
  switch (change) {
    case 'in':
      return '+' + GLUE_SPACE;
    case 'out':
      return '-' + GLUE_SPACE;
    case 'in-out':
      return '±' + GLUE_SPACE;
    default:
      return '';
  }
};

export type MoneyApproximation = 'normal' | 'mini';

export const formatApproximation = (approximation?: MoneyApproximation): string => {
  switch (approximation) {
    case 'normal':
      return APPROXIMATE_SIGN + GLUE_SPACE;
    case 'mini':
      return APPROXIMATE_MINI_SIGN;
    default:
      return '';
  }
};

export type MoneySymbol = string;

export const formatSymbol = (symbol?: MoneySymbol): string => {
  return symbol ? GLUE_SPACE + symbol.toUpperCase() : '';
};

export type MoneySign = string;

export const formatSign = (sign?: MoneySign): string => {
  return sign || '';
};
