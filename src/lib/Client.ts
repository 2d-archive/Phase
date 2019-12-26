import Logger from "@ayana/logger";
import { Client } from "discord.js";
import { Manager, ManagerOptions } from "discord.js-andesite";
import { join } from "path";
import { getRepository } from "typeorm";
import { WebServer } from "../web/server";
import { CommandHandler } from "./command/Handler";
import { ListenerHandler } from "./listener/Handler";
import { GuildProvider, UserProvider, User, Guild } from "../database";

export interface PhaseOptions {
  ownerList: string[];
  music?: ManagerOptions;
}

export class PhaseClient extends Client {
  public ownerList!: string[];

  public logger: Logger = Logger.get(PhaseClient);
  public server: WebServer = new WebServer(this);
  public db_g: GuildProvider = new GuildProvider();
  public db_u: UserProvider = new UserProvider();
  public andesite: Manager = new Manager(this, {
    restTimeout: 20000,
    nodes: [{
      auth: process.env.ANDESITE_AUTH,
      host: process.env.ANDESITE_HOST!,
      port: "5000",
      name: "Main"
    }]
  });

  // public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {});
  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    automateCategories: true,
    directory: join(__dirname, "..", "listeners")
  });

  public commandHandler: CommandHandler = new CommandHandler(this, {
    automateCategories: true,
    directory: join(__dirname, "..", "commands"),
    extensions: [".js"],
    prefix: async (message) => {
      if (!message.guild) return ["phase ", "p!"];
      const guild = await this.db_g.ensure(message.guild);
      return guild.prefixes;
    }
  });

  // public q(child: RouterChilden, query: any) {
  // return this.router[child].query(query);
  // }

  public async setup({ ownerList }: PhaseOptions) {
    this.ownerList = ownerList;
    this.listenerHandler.setEmitters({
      client: this,
      listeners: this.listenerHandler,
      commands: this.commandHandler,
      andesite: this.andesite,
      process
    });

    await this.db_u.init(getRepository(User));
    await this.db_g.init(getRepository(Guild));

    await this.listenerHandler.loadAll();
    await this.commandHandler.loadAll();
  }
}