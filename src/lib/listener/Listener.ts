import { Phaser, PhaserOptions } from "../classes/Phaser";
import { EventEmitter } from "events";

export interface EventOptions extends PhaserOptions {
	emitter?: string | EventEmitter;
	event: string;
	type?: "on" | "once" | "off";
}

export class Listener extends Phaser {
	public emitter: EventEmitter | string;
	public event: string;
	public type: "on" | "once" | "off"
	public constructor(id: string, options: EventOptions) {
		super(id, options);

		this.emitter = options.emitter === undefined ? "client" : options.emitter;
		this.event = options.event;
		this.type = options.type === undefined ? "on" : options.type;
	}
}