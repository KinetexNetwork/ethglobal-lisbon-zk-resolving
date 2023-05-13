type FormatShortAddressOptions = {
  compact?: boolean;
};

/**
 * Transforms long address to short form w/ ellipsis:
 *
 * 0xdac17f958d2ee523a2206206994597c13d831ec7 -> 0xdac1...31ec7
 */
export const formatShortAddress = (address: string, options?: FormatShortAddressOptions): string => {
  const { compact = false } = options ?? {};
  const startChars = compact ? 4 : 6;
  const endChars = compact ? 2 : 5;
  const separator = compact ? '‥' : '...';
  const start = address.slice(0, startChars);
  const end = address.slice(-endChars);
  return start + separator + end;
};
