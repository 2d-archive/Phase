import { PhaserHandler, HandlerOptions } from "../classes/Handler";
import { Listener } from "./Listener";
import { PhaseClient } from "../Client";
import { EventEmitter } from "events";
import { IllegalArgumentError } from "@ayanaware/errors";

export class ListenerHandler extends PhaserHandler<Listener> {
	public emitters: { [key: string]: EventEmitter } = {}
	public constructor(client: PhaseClient, options: HandlerOptions) {
		super(client, {
			...options,
			handles: Listener
		});
	}

	public register(listener: Listener, path: string) {
		super.register(listener, path);

		if (listener.emitter instanceof EventEmitter) {
			listener.emitter[listener.type](listener.event, listener.run.bind(listener));
			return;
		}

		let emitter = this.emitters[listener.emitter];
		if (!emitter) throw new IllegalArgumentError(`Listener "${listener.id}" is requesting an invalid emitter.`);

		emitter[listener.type](listener.event, listener.run.bind(listener));
		return;
	}

	public setEmitters(emitters: { [key: string]: EventEmitter }) {
		return Object.assign(this.emitters, emitters);
	}
}