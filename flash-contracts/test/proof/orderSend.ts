import { mockHashEventProof } from './common';

export const mockOrderSendProof = (orderHash: string, toChain: string | number): string => {
  return mockHashEventProof('AssetSend(bytes32)', orderHash, toChain);
};
