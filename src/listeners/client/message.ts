import { Listener, ReplyHandler, Call } from "../../lib";
import { Message } from "discord.js";
import { parse, ParsedMessage, ResultCode } from "discord-command-parser";

export default class MessageReceived extends Listener {
	public constructor() {
		super("message-received", {
			event: "message"
		});
	}

	public async run(message: Message) {
		if (message.author.bot) return;

		const parsed: ParsedMessage = parse(message, await this.getPrefixes(message));
		const call = new Call(message, parsed.command);

		if (!parsed.success) {
			switch (parsed.code) {
				case ResultCode.UNKNOWN_ERROR:
					this.client.emit("error", parsed.error, "command-parsing");
					call.reply.embedded("command:parsing_error", { type: "error", localized: true });
					break;
			}
			return;
		}

		

	}

	private async getPrefixes(message: Message): Promise<string[]> {
		if (!message.guild) return [ "phase ", "p!" ];
		
		const guild = await this.client.db_g.ensure(message.guild);
		return guild.prefixes;
	}
}