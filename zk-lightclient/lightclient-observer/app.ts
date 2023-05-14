import { getNetwork } from "./utils/getNetwork";
import { LightClientObserver } from "./core/LightClientObserver";
import { getAppArgs } from "./utils/getAppArgs";
import dotenv from "dotenv";

(async () => {
	dotenv.config();
	const { network, lightClientNetwork } = getAppArgs();

	const observer = new LightClientObserver(getNetwork(network), getNetwork(lightClientNetwork));
	await observer.observe();
})();
