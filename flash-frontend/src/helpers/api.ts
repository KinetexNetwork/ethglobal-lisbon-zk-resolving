export const stringToApiNumber = (value: string): number => {
  // API works fine with string values for numbers (floats, ints, decimals).
  // So we pass string value as-is tricking compiler to believe it's a number.
  // This is more robust than converting to number type since avoids possible
  // transformations (such as exponential form in JSON etc.)
  return value as unknown as number;
};
