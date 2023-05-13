/**
 * Adds specified number of decimals to given amount making it integer
 *
 * * `decimalInt(12, 6) -> '12000000'`
 * * `decimalInt(32.5, 8) -> '3250000000'`
 * * `decimalInt('0.095', 4) -> '950'`
 *
 * @param amount Amount to add decimals to
 * @param decimals Number of decimals to add
 */
export const decimalInt = (amount: string | number, decimals: number): string => {
  if (decimals < 0) {
    throw new Error('Negative decimals');
  }

  // Force amount to have dot and at least 'decimals' digits after it
  let dec = amount.toString();
  const negative = dec.startsWith('-');
  if (negative) {
    dec = dec.replace('-', '');
  }
  if (!dec.includes('.')) {
    dec += '.';
  }
  dec += '0'.repeat(decimals);

  // Shift dot 'decimals' digits to the right
  // 4 decimals: '123.4567890' -> '1234567.890'
  const dotPos = dec.indexOf('.');
  dec = (
    dec.slice(0, dotPos) +
    dec.slice(dotPos + 1, dotPos + 1 + decimals) +
    '.' +
    dec.slice(dotPos + 1 + decimals)
  );

  // Trim start zeros
  dec = dec.replace(/^0+/, '');

  // Trim trailing '.' & everything behind it
  dec = dec.replace(/\..*$/, '');

  dec = dec || '0';
  if (negative && dec !== '0') {
    dec = '-' + dec;
  }

  return dec;
};
