import axios from "axios";
import { BigNumber, Contract, Wallet, ethers, providers } from "ethers";

import lightClientAbi from "../contract-abi/LightClient.json";

import { GetBlockHeader200, GetBlockHeader200Data, getBlockHeader } from "../api/beaconClient";
import { SupportedNetworks } from "../types/networks";
import { buildEndpoint } from "../utils/buildEndpoint";
import { Nullable } from "../types/helpers";
import { OBSERVE_INTERVAL } from "../constants/observer";
import { Logger } from "../utils/logger";
import { getLightClientAddress } from "../utils/contracts";

export class LightClientObserver {
	network: SupportedNetworks;
	lightClientNetwork: SupportedNetworks;
	slot: Nullable<string>;
	provider: providers.JsonRpcProvider;
	lightClient: Contract;
	isObserving: boolean;
	observeInterval: Nullable<NodeJS.Timer>;
	logger: Logger;
	wallet: Wallet;

	get observing() {
		return this.isObserving;
	}

	constructor(network: SupportedNetworks, lightClientNetwork: SupportedNetworks) {
		this.network = network;
		this.lightClientNetwork = lightClientNetwork;
		this.isObserving = false;

		this.configureAxios();

		this.provider = new providers.JsonRpcProvider(buildEndpoint(this.network));

		const deployer_pk = process.env.DEPLOYER_PK;
		if (!deployer_pk) {
			throw new Error();
		}

		this.wallet = new Wallet(deployer_pk).connect(this.provider);
		this.lightClient = new Contract(getLightClientAddress(this.network, lightClientNetwork), lightClientAbi, this.wallet);

		this.logger = new Logger();
	}

	configureAxios() {
		axios.defaults.baseURL = buildEndpoint(this.lightClientNetwork);
		axios.defaults.headers.common = {
			accept: "application/json",
		};
	}

	async runApi<T, K>(method: () => Promise<T>): Promise<Nullable<K>> {
		try {
			//@ts-ignore
			return (await method()).data.data;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.log("Received API error: ", error.message);
				return null;
			}

			this.logger.log("Unknown error. Check your api config");
			return null;
		}
	}

	async runContractGetter<T>(method: () => Promise<T>): Promise<Nullable<T>> {
		try {
			//@ts-ignore
			return await method();
		} catch (error) {
			if (error instanceof Error) {
				this.logger.log("Received contract error: ", error.message);
				return null;
			}

			this.logger.log("Unknown error. Check your contract config");
			return null;
		}
	}

	async runTx(call: () => any): Promise<boolean> {
		try {
			//@ts-ignore
			const tx = await call();
			await tx.wait();
			return true;
		} catch (error) {
			if (error instanceof Error) {
				this.logger.log("Received contract error: ", error.message);
				return false;
			}

			this.logger.log("Unknown error. Check your contract config");
			return false;
		}
	}

	static getChainSyncCommiteePeriod(slot: number): number {
		return Math.floor(slot / 8192);
	}

	async getChainCurrentJustifiedSlot(): Promise<Nullable<number>> {
		const res = await this.runApi<GetBlockHeader200, GetBlockHeader200Data>(() => getBlockHeader("justified"));

		if (res && res.header?.message?.slot) {
			return parseInt(res.header.message.slot, 10);
		}

		return null;
	}

	async getContractHead(): Promise<Nullable<BigNumber>> {
		return await this.runContractGetter(() => this.lightClient.head());
	}

	async getContractHeaders(slot: number | BigNumber) {
		return await this.lightClient.headers(slot);
	}

	async getContractSyncCommiteePoseidon(syncCommitteePeriod: number | BigNumber) {
		return await this.runContractGetter(() => this.lightClient.syncCommitteePoseidons(syncCommitteePeriod));
	}

	async fetchStepParams() {
		return (await axios.get(process.env.PROOF_BUILDER_URL + '/step/' + this.lightClientNetwork + '/justified/head')).data;
	}

	async fetchRotateParams() {
		return (await axios.get(process.env.PROOF_BUILDER_URL + '/rotate/' + this.lightClientNetwork + '/justified/head')).data;
	}

	async updateLightClient(params: any): Promise<boolean> {
		return await this.runTx(() => this.lightClient.step(params));
	}

	async updateSyncCommittee(params: any): Promise<boolean> {
		return await this.runTx(() => this.lightClient.rotate(params));
	}

	async observerFunction() {
		this.logger.log("👀 observing....");

		const justifiedSlot = await this.getChainCurrentJustifiedSlot();
		if (!justifiedSlot) return;

		const contractSlotBN = await this.getContractHead();
		if (!contractSlotBN) return;

		const contractSlot = contractSlotBN.toNumber();
		if (justifiedSlot !== contractSlot) {
			this.logger.log(`❗ lightClient out of sync, chain justified slot: ${justifiedSlot}, contract justified slot: ${contractSlot}`);
			const stepParams = await this.fetchStepParams();
			if (!stepParams) return;

			this.logger.log("⚙️ updating the LightClient... ");
			const updateSuccess = await this.updateLightClient(stepParams);
			if (!updateSuccess) {
				this.logger.log("❗ error updating the light client");
				return;
			}

			this.logger.log("✅ light client updated successfully!");
		}

		const syncCommitteePeriod = LightClientObserver.getChainSyncCommiteePeriod(justifiedSlot);
		this.logger.log(`👪 current sync committee period: ${syncCommitteePeriod}`);
		const poseidonSyncCommitee = await this.getContractSyncCommiteePoseidon(syncCommitteePeriod);

		if (!poseidonSyncCommitee) {
			this.logger.log("❗ wasnt able to get contract poseidonSyncCommitee");
		}

		if (poseidonSyncCommitee === ethers.constants.AddressZero) {
			this.logger.log("❗ poseidonSyncCommitee hash for the current period doesnt exist!");

			const rotatePrams = await this.fetchRotateParams();
			if (!rotatePrams) return;

			const syncCommiteeSuccess = await this.updateSyncCommittee(rotatePrams);
			if (!syncCommiteeSuccess) {
				this.logger.log("❗ error updating sync committee");
				return;
			}

			this.logger.log("✅ sync commitee updated successfully!");
		}
	}

	async observe() {
		this.isObserving = true;

		this.observerFunction();

		this.observeInterval = setInterval(() => {
			this.observerFunction();
		}, OBSERVE_INTERVAL);
	}

	async stopObserving() {
		this.isObserving = false;

		if (this.observeInterval) {
			clearInterval(this.observeInterval);
		}
	}

	changeNetwork(network: SupportedNetworks) {
		this.network = network;
	}

	changeSlot(slot: string) {
		this.slot = slot;
	}
}
