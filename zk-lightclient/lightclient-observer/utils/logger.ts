import fs from "fs";
import dayjs from "dayjs";

export class Logger {
	path: string;

	constructor() {
		this.path = `./logs/logs-${dayjs().format("YYYY-MM-DD-hh:mm:ss")}.txt`;
		fs.writeFileSync(this.path, this.prepareLog("Initialized"));
	}

	prepareLog(...args: string[]) {
		const msg = args.join(" ");
		return `[${dayjs().format("hh:mm:ss")}] ${msg}`;
	}

	addToLogFile(msg: string) {
		fs.open(this.path, "a", 666, function (e, id) {
			fs.write(id, msg + "\n", null, "utf8", function () {
				fs.close(id, function () {});
			});
		});
	}

	log(...args: string[]) {
		const prepared = this.prepareLog(...args);
		console.log(prepared);
		this.addToLogFile(prepared);
	}
}
