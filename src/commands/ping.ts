import { Command } from "../lib/command/Command";
import { Call } from "../lib/command/Call";
import StringBuilder, { PLUGINS } from "../util/StringBuilder";

export default class PingCommand extends Command {
	public constructor() {
		super("ping", {
			aliases: [ "ping", "pong" ],
			description: {
				content: "Sends the bot & shard latency."
			}
		});
	}

	public async run({ message, reply }: Call) {
		const start = Date.now();
		return new Promise(_ => {
			return (this.client["api"] as any).channels[message.channel.id].post().then(() => {
				_(reply.embedded(new StringBuilder()
					.append(["API Ping", start - Date.now()])
					.append(["Shard Ping", message.guild ? message.guild.shard.ping : this.client.ws.ping])
					.build(PLUGINS.prolog)));
			});
		});
	}
}