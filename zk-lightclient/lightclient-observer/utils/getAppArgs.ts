import { parseArgs } from "node:util";
import { AppArgs } from "../types/app";

export const getAppArgs = (): AppArgs => {
	const {
		values: { network, lightClientNetwork, slot },
	} = parseArgs({
		options: {
			network: {
				type: "string",
				short: "n",
			},
			lightClientNetwork: {
				type: "string",
				short: "n",
			},
			slot: {
				type: "string",
			},
		},
	});

	return { network, lightClientNetwork, slot };
};
