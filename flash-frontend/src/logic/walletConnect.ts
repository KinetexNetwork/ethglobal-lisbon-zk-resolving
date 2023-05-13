import { OpenConnectWalletFunc, useWallet } from 'logic/wallet';

type WalletConnectData = {
  needed: boolean;
  address: string;
  action: OpenConnectWalletFunc;
};

export const useWalletConnectAction = (): WalletConnectData => {
  const wallet = useWallet();

  const needed = !wallet.isConnected;
  const address = wallet.address;
  const action = wallet.openConnect;

  const data: WalletConnectData = {
    needed,
    address,
    action,
  };
  return data;
};
