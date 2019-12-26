import { Repository, BaseEntity, Entity, PrimaryColumn, Column } from 'typeorm';
import { Guild as DiscordGuild } from "discord.js"
import { Provider } from '../lib/classes/Provider';
import { Languages } from '../util/Constants';

@Entity()
export class Guild extends BaseEntity {

	@PrimaryColumn({ unique: true })
	public id!: string;

	@Column("simple-array")
	public prefixes: string[] = [ "phase ", "p!" ];

	@Column("enum")
	public language: Languages = Languages.english;

	constructor(id: string) {
		super();
		this.id = id;
	}
}

export default class GuildProvider extends Provider<String, Guild> {
  public ['constructor']: typeof GuildProvider;
	public repo!: Repository<Guild>;

	public async init(repo: Repository<Guild>) {
		this.repo = repo;
		const guilds = await this.repo.find();
		for (const guild of guilds) {
			this.items.set(guild.id, guild);
		}
	}

	public get<K extends keyof Guild, T = undefined>(
		guild: string | DiscordGuild,
		key: K,
		defaultValue?: T,
	): Guild[K] | T {
    const id = this.constructor.getGuildId(guild),
      item = this.items.get(id);
      
    if (!item || item[key] === undefined) return defaultValue as T;
    return item[key];
  }
  
  public async ensure(guild: string | DiscordGuild): Promise<Guild> {
    const id = this.constructor.getGuildId(guild)
    let data = this.items.get(id);
    if (!data) {
      data = new Guild(id);
      await data.save();
    }

    return data;
  }

  public async set<K extends keyof Guild>(
    guild: string | DiscordGuild, 
    key: K, value: Guild[K]
  ) {
		const id = this.constructor.getGuildId(guild);
		const data = await this.ensure(id);
		data[key] = value;
		this.items.set(id, data);

		return this.repo
			.createQueryBuilder()
			.insert()
			.into(Guild)
			.values({ id, ...data })
			.execute();
	}

	public async delete(guild: string | DiscordGuild, key: keyof Guild) {
		const id = this.constructor.getGuildId(guild);
		const data = await this.ensure(id);
		delete data[key];

		return this.repo
			.createQueryBuilder()
			.insert()
			.into(Guild)
			.values({ id, ...data })
			.execute();
	}

	public async clear(guild: string | DiscordGuild) {
		const id = this.constructor.getGuildId(guild);
		this.items.delete(id);

		return this.repo.delete(id);
	}

	private static getGuildId(guild: string | DiscordGuild) {
		if (guild instanceof DiscordGuild) return guild.id;
		if (guild === 'global' || guild === null) return '0';
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}