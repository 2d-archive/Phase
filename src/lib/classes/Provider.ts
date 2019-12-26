import { Collection } from "discord.js";

export abstract class Provider<K, V> {
  items: Collection<K, V> = new Collection();
  abstract init(...args: any): Promise<any> | any;
}