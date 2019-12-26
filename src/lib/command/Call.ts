import i18n, { TOptions, StringMap } from "i18next";
import { Message } from "discord.js";
import { MessageEmbed } from "discord.js";
import { MessageOptions } from "discord.js";
import { PhaseClient } from "../Client";
import { Guild, User, TextChannel } from "discord.js";
import { DMChannel } from "discord.js";

export class Call {

  public guild: Guild | null;
  public author: User;
  public channel: TextChannel | DMChannel;
  public client: PhaseClient;
  public reply: ReplyHandler;

  public constructor(
    public readonly message: Message,
    public readonly invoke: string
  ) {
    this.client = <PhaseClient> message.client;
    this.guild = message.guild;
    this.author = message.author;
    this.channel = message.channel;
    this.reply = new ReplyHandler(this);
  };

  public t: (path: string, options: TOptions<StringMap>) => string = (p, o) => {
    if (!this.guild) return i18n.getFixedT("en_US")(p, o);
    return i18n.getFixedT(this.client.db_g.get(this.guild, "language"))(p, o);
  }
}

export interface EmbeddedOptions {
  type?: "error" | "prompt" | "reply";
  localized?: boolean;
  t?: TOptions<StringMap>;
}

export class ReplyHandler {
  constructor(public call: Call) {}

  embedded(msg: string, options: EmbeddedOptions & MessageOptions = {}): Promise<Message> {
    const embed = new MessageEmbed(), type = options.type || "reply";
    embed.setAuthor(this.call.message.author.username, this.call.message.author.displayAvatarURL());
    embed.setFooter(`Phase v1 | ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}`, this.call.client.user!.displayAvatarURL());
    embed.setColor({ reply: "#f7ff5e", error: "#ff3838", prompt: "#5effac" }[type]);
    embed.setDescription((options.localized || false) ? this.call.t(msg, options.t || {}) : msg)
    return this.call.message.channel.send(embed, options);
  }
}