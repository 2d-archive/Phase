import { PhaserHandler, HandlerOptions } from "../classes/Handler";
import { Message } from "discord.js";
import { InhibitorType, Inhibitor } from "./Inhibitor";
import { Command } from "../command/Command";
import Util from "../../util/Util";
import { PhaseClient } from "../Client";

export class InhibitorHandler extends PhaserHandler<Inhibitor> {
	public constructor(client: PhaseClient, options: HandlerOptions) {
		super(client, {
			...options,
			handles: Inhibitor
		});	
	}

	public async handle(type: InhibitorType, message: Message, command?: Command) {
		if (!this.modules.size) return null;

		const inhibitors = this.modules.filter(i => i.type === type);
		if (!inhibitors.size) return null;

		const promises = [];
		for (const [, _] of inhibitors) {
			promises.push((async () => {
				let r = _.run(message, command);
				if (Util.isPromise(r)) r = await r;
				if (r) return r;
				return null;
			})());
		}

		const inhibited: Inhibitor[] = (await Promise.all(promises)).filter(r => r);
		if (!inhibited.length) return null;

		inhibited.sort((a, b) => a.priority - b.priority);
		return inhibited[0].reason;
	}
}