import { Repository, BaseEntity, PrimaryColumn, Entity } from 'typeorm';
import { User as DiscordUser } from "discord.js"
import { Provider } from '../lib/classes/Provider';

@Entity()
export class User extends BaseEntity {
	@PrimaryColumn({ unique: true })
	public id: string;

	constructor(id: string) {
		super();
		this.id = id;
	}
}

export default class UserProvider extends Provider<String, User> {
	public ['constructor']: typeof UserProvider;
	public repo!: Repository<User>;

	public async init(repo: Repository<User>) {
		this.repo = repo;
		const users = await this.repo.find();
		for (const user of users) {
			this.items.set(user.id, user);
		}
	}

	public get<K extends keyof User, T = undefined>(
		user: string | DiscordUser,
		key: K,
		defaultValue?: T,
	): User[K] | T {
    const id = this.constructor.getUserId(user),
      item = this.items.get(id);
      
    if (!item || item[key] === undefined) return defaultValue as T;
    return item[key];
  }
  
  public async ensure(user: string | DiscordUser): Promise<User> {
    const id = this.constructor.getUserId(user)
    let data = this.items.get(id);
    if (!data) {
      data = new User(id);
      await data.save();
    }

    return data;
  }

  public async set<K extends keyof User>(
    user: string | DiscordUser, 
    key: K, value: User[K]
  ) {
		const id = this.constructor.getUserId(user);
		const data = await this.ensure(id);
		data[key] = value;
		this.items.set(id, data);

		return this.repo
			.createQueryBuilder()
			.insert()
			.into(User)
			.values({ id, ...data })
			.execute();
	}

	public async delete(user: string | DiscordUser, key: keyof User) {
		const id = this.constructor.getUserId(user);
		const data = await this.ensure(id);
		delete data[key];

		return this.repo
			.createQueryBuilder()
			.insert()
			.into(User)
			.values({ id, ...data })
			.execute();
	}

	public async clear(user: string | DiscordUser) {
		const id = this.constructor.getUserId(user);
		this.items.delete(id);

		return this.repo.delete(id);
	}

	private static getUserId(user: string | DiscordUser) {
		if (user instanceof DiscordUser) return user.id;
		if (user === 'global' || user === null) return '0';
		if (typeof user === 'string' && /^\d+$/.test(user)) return user;
		throw new TypeError('Invalid user specified. Must be a User instance, user ID, "global", or null.');
	}
}