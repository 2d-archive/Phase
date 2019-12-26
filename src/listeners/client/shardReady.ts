import { Listener } from "../../lib";
import { init } from "@sentry/node";
import { WebServer } from "../../web/server";

export default class ShardReady extends Listener {
	public constructor() {
		super("ready", {
			event: "ready",
			type: "once"
		});
	}

	public async run(client = this.client) {
		this.client.andesite.init(this.client.user!.id);

		init({
      dsn: process.env.SENTRY_DSN,
			serverName: `Phase v${process.env.VERSION}`,
			release: process.env.VERSION,
			environment: process.env.NODE_ENV!.toLowerCase()
		});
		
		if (process.env.API_ENABLED) {
			try {
				await client.server.init();
				client.server.app.listen(Number(process.env.API_PORT), () => {
					WebServer.logger.info(`WebServer listening on port ${process.env.API_PORT} with ${client.server.modules.length} routes loaded.`);
				});
			} catch (e) {
				client.logger.error(e);
			}
		}
	}
}