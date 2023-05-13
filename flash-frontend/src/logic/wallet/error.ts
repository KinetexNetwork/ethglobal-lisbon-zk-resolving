export class WalletError extends Error {
  public readonly inner: unknown;

  constructor(message: string, inner?: unknown) {
    super(message);
    this.name = 'WalletError';
    this.inner = inner;
  }
}

export const getWalletErrorDescription = (error: unknown): string => {
  let description = '';
  if (error instanceof WalletError) {
    description = error.message;
  }
  return description || 'Wallet operation failed';
};
