import { Amount } from 'models';

export const ZERO_AMOUNT: Amount = { v: '0', d: 0 };

const tenInPower = (power: number): bigint => {
  return power > 0 ? 10n ** BigInt(power) : 1n;
};

const toSameOrderInts = (left: Amount, right: Amount): [left: bigint, right: bigint, decimals: number] => {
  let leftInt = BigInt(left.v);
  let rightInt = BigInt(right.v);
  let decimals = left.d;
  if (left.d > right.d) {
    rightInt *= tenInPower(left.d - right.d);
  } else if (left.d < right.d) {
    leftInt *= tenInPower(right.d - left.d);
    decimals = right.d;
  }
  return [leftInt, rightInt, decimals];
};

type CompareResult = 'less' | 'equal' | 'greater';

export const compareAmount = (left: Amount, right: Amount): CompareResult => {
  const [leftInt, rightInt] = toSameOrderInts(left, right);
  return leftInt < rightInt ? 'less' : leftInt > rightInt ? 'greater' : 'equal';
};

type CompareResultIs =
  | 'less'
  | 'equal'
  | 'greater'
  | 'not-less'
  | 'not-equal'
  | 'not-greater'
  | 'less-or-equal'
  | 'greater-or-equal';

export const compareAmountIs = (left: Amount, is: CompareResultIs, right: Amount): boolean => {
  const result = compareAmount(left, right);
  switch (is) {
    case 'less':
      return result === 'less';
    case 'greater':
      return result === 'greater';
    case 'equal':
      return result === 'equal';
    case 'not-less':
    case 'greater-or-equal':
      return result !== 'less';
    case 'not-greater':
    case 'less-or-equal':
      return result !== 'greater';
    case 'not-equal':
      return result !== 'equal';
  }
};

export const multiplyAmount = (left: Amount, right: Amount): Amount => {
  const v = (BigInt(left.v) * BigInt(right.v)).toString();
  const d = left.d + right.d;
  return { v, d };
};

export const amountToOrder = (amount: Amount, decimals: number): Amount => {
  if (amount.d === decimals) {
    return amount;
  }

  let v: string;
  if (decimals > amount.d) {
    v = (BigInt(amount.v) * tenInPower(decimals - amount.d)).toString();
  } else {
    v = (BigInt(amount.v) / tenInPower(amount.d - decimals)).toString();
  }

  return { v, d: decimals };
};
