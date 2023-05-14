import { SupportedNetworks } from "../types/networks";

export const getReceiptsMethod = (network: SupportedNetworks) => (network === SupportedNetworks.GNOSIS ? "parity_getBlockReceipts" : "eth_getBlockReceipts");
