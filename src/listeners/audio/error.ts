import { Listener } from "../../lib";
import { addBreadcrumb, captureException, Severity } from "@sentry/node";
import { LogTopics } from "../../util/Constants";

let finished = 0;

export default class NodeErrored extends Listener {
	public constructor() {
		super("node-errored", {
			emitter: "andesite",
			event: "error"
		});
	}

	public async run(name: string, error: any) {		
		Error.captureStackTrace(error)
		this.client.logger.error(error, LogTopics.ANDESITE, { topic: name });
		
		addBreadcrumb({
			category: "andesite",
			message: "node_error",
			level: Severity.Error,
			data: {
				node: name,
				shard: this.client.shard!.id
			}
		});

		captureException(error);
	}
}