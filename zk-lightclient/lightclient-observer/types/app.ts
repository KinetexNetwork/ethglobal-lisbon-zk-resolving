import { Nullable } from "./helpers";

export interface AppArgs {
	network: Nullable<string>;
	lightClientNetwork: Nullable<string>;
	slot: Nullable<string>;
}
