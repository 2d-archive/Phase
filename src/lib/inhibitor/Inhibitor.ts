import { Phaser, PhaserOptions } from "../classes/Phaser";

export type InhibitorType = "pre" | "post" | "all";
export interface InhibitorOptions extends PhaserOptions {
	priority?: number;
	type?: InhibitorType;
	reason: string;
}

export class Inhibitor extends Phaser {
	public priority: number;
	public type: InhibitorType;
	public reason: string;

	public constructor(id: string, {
		category = "default",
		disabled = false,
		priority = 0,
		type = "post",
		reason
	}: InhibitorOptions) {
		super(id, { category, disabled });
		this.priority = priority;
		this.type = type;
		this.reason = reason;
	}
}