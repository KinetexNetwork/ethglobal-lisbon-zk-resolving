import { LIGHT_CLIENT_SCROLL_ADDRESS } from "../constants/lightClient";
import { Nullable } from "../types/helpers";
import { SupportedNetworks } from "../types/networks";

export const getLightClientAddress = (network: Nullable<string>, lightClientNetwork: SupportedNetworks): string => {
	if (!network) {
		throw new Error("No network argument. Pass the current network with --network arg");
	}

	switch (network) {
		case SupportedNetworks.SCROLL:
			return LIGHT_CLIENT_SCROLL_ADDRESS[lightClientNetwork];

		default:
			throw new Error("Unsupported network");
	}
};
