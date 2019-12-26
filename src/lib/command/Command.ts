import { Phaser, PhaserOptions } from "../classes/Phaser";
import { SubCommands } from "./SubCommands";
import { PermissionResolvable } from "discord.js";
import { Message } from "discord.js";
import { PrefixSupplier, CommandHandler } from "./Handler";
import { Snowflake } from "discord.js";
import { Call } from "./Call";
import { ObjectLiteral } from "typeorm";
import { MethodNotImplementedError } from "@ayanaware/errors";
 
export type CommandDescription = {
  content?: string;
  usage?: string;
  examples?: string[]
}

export type IgnorePredicate<T> = T | ((message: Message) => T);
export type Permissions =
  PermissionResolvable | PermissionResolvable[] | ((message: Message) => PermissionResolvable | PermissionResolvable[]);

export interface CommandOptions extends PhaserOptions {
  aliases?: string[];
  subcommands?: string[]
  description?: CommandDescription;
  args?: {}[];
  childof?: string;
  channel?: "guild" | "dm";
  prefix?: PrefixSupplier;
  condition?: (message: Message) => boolean;
  ignoreCooldown?: IgnorePredicate<Snowflake | Snowflake[]>
  ignorePermissions?: IgnorePredicate<Snowflake | Snowflake[]>
  ownerOnly?: boolean;
  cooldown?: number;
  memberPermissions?: Permissions;
  clientPermissions?: Permissions;
}

export class Command extends Phaser {

  public handler!: CommandHandler;
  public aliases: string[];
  public subcommands: SubCommands;
  public description: CommandDescription;
  public args: any;
  public childof?: string;
  public channel?: "guild" | "dm";
  public clientPermissions: Permissions;
  public condition: (message: Message) => boolean;
  public cooldown?: number;
  public ignoreCooldown: IgnorePredicate<Snowflake | Snowflake[]>;
  public ignorePermissions: IgnorePredicate<Snowflake | Snowflake[]>;
  public memberPermissions: Permissions;
  public ownerOnly: boolean;
  public prefix: PrefixSupplier;

  public constructor(id: string, options: CommandOptions = {}) {
    super(id, options);

    const {
      aliases = [],
      subcommands = [],
      description = {},
      args = [],
      childof,
      channel,
      // @ts-ignore
      clientPermissions = this.clientPermissions,
      condition = (() => true),
      cooldown,
      ignoreCooldown = [],
      ignorePermissions = [],
      // @ts-ignore
      memberPermissions = this.memberPermissions,
      ownerOnly = false,
      // @ts-ignore
      prefix = this.prefix
    } = options;
    
    this.aliases = aliases;
    this.subcommands = new SubCommands(this, subcommands);
    this.description = description;
    this.args = (`hi`);
    this.childof = childof;
    this.channel = channel;
    this.condition = condition;
    this.cooldown = cooldown;
    this.ownerOnly = ownerOnly;

    this.ignoreCooldown = typeof ignoreCooldown === "function"
    ? ignoreCooldown.bind(this)
    : ignoreCooldown;

    this.ignorePermissions = typeof ignorePermissions === "function"
      ? ignorePermissions.bind(this)
      : ignorePermissions;

    this.clientPermissions = typeof clientPermissions === "function"
      ? clientPermissions.bind(this)
      : clientPermissions;

    this.memberPermissions = typeof memberPermissions === "function"
      ? memberPermissions.bind(this)
      : memberPermissions;

    this.prefix = typeof prefix === "function" ? prefix.bind(this) : prefix;
  }

  public async run(call: Call, args: ObjectLiteral): Promise<any> {
    throw new MethodNotImplementedError();
  }
}