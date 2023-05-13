import { mockHashEventProof } from './common';

export const mockOrderReceiveProof = (orderHash: string, fromChain: string | number): string => {
  return mockHashEventProof('AssetReceive(bytes32)', orderHash, fromChain);
};
