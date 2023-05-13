import { decimalInt } from './decimal';

export const AMOUNT_DECIMALS = 18; // ETH-like

export const amount = (amount: number | string): string => {
  return decimalInt(amount, AMOUNT_DECIMALS);
};
