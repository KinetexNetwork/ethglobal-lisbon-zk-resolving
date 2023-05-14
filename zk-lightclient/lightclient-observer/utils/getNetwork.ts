import { SupportedNetworks } from "../types/networks";
import { Nullable } from "../types/helpers";

export const getNetwork = (network: Nullable<string>): SupportedNetworks => {
	if (!network) {
		throw new Error("No network argument. Pass the current network with --network arg");
	}

	switch (network) {
		case SupportedNetworks.MAINNET:
			return SupportedNetworks.MAINNET;

		case SupportedNetworks.GOERLI:
			return SupportedNetworks.GOERLI;

		case SupportedNetworks.GNOSIS:
			return SupportedNetworks.GNOSIS;

		case SupportedNetworks.SCROLL:
			return SupportedNetworks.SCROLL;

		default:
			throw new Error("Unsupported network");
	}
};