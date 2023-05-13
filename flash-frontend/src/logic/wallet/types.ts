export type OpenConnectWalletFunc = () => void;

export type IsOnChainFunc = (chainId: string | undefined) => boolean;

export type SwitchChainFunc = (chainId: string | undefined) => Promise<void>;

export type SendTransactionParams = {
  chainId: string;
  from: string;
  to: string;
  value?: string;
  data?: string;
};
export type SendTransactionFunc = (params: SendTransactionParams) => Promise<void>;

export type SignTypedDataParams = {
  chainId?: string;
  from: string;
  data: string;
};
export type SignTypedDataFunc = (params: SignTypedDataParams) => Promise<string>;

export type WalletData = {
  isConnected: boolean;
  openConnect: OpenConnectWalletFunc;
  isOnChain: IsOnChainFunc;
  switchChain: SwitchChainFunc;
  address: string;
  sendTransaction: SendTransactionFunc;
  signTypedData: SignTypedDataFunc;
};
