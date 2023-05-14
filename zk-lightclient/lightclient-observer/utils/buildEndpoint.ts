import { SupportedNetworks } from "../types/networks";

export const buildEndpoint = (network: SupportedNetworks) => {
	switch (network) {
		case SupportedNetworks.GNOSIS:
			return process.env.RPC_GNOSIS;

		case SupportedNetworks.GOERLI:
			return process.env.RPC_GOERLI;

		case SupportedNetworks.MAINNET:
			return process.env.RPC_MAINNET;

		case SupportedNetworks.SCROLL:
			return process.env.RPC_SCROLL;

		default:
			throw new Error("Unsupported network");
	}
};
