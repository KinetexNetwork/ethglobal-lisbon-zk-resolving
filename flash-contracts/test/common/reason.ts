const QUOTE = `(\\'|\\")`;

export const reason = (revertMessage: string): RegExp => {
  return new RegExp(`reverted with reason string ${QUOTE}${revertMessage}${QUOTE}`, 'g');
};
