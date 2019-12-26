import { Message } from "discord.js";
import { Command } from "./Command";
import { PhaserHandler, HandlerOptions } from "../classes/Handler";
import { PhaseClient } from "../Client";

export type PrefixSupplier = (message: Message) => Promise<string | string[]> | string | string[];

export interface CommandHandlerOptions extends HandlerOptions {
  prefix: PrefixSupplier;
}

export class CommandHandler extends PhaserHandler<Command> {
  public constructor(client: PhaseClient, options: CommandHandlerOptions) {
    super(client, {
      ...options,
      handles: Command
    });
  }

  public async handleMessage(message: Message) {
    
  }
}