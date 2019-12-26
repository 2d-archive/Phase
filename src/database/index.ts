import { createConnection, Connection } from "typeorm";
import Logger from "@ayana/logger";
import GuildProvider, { Guild } from "./Guild";
import UserProvider, { User } from "./User";

class Database {
  public initialized: boolean = false;
  public connection!: Connection
  public log = Logger.get(Database);

  async init() {
    if (this.initialized) return;
    this.connection = await createConnection({
      type: "postgres",
      database: "phase",
      entities: [ Guild, User ],
      host: "localhost",
      username: "postgres",
      password: "009041305DvR"
    });
    this.initialized = true;
  }
}

export {
  Database,
  UserProvider,
  GuildProvider,
  User,
  Guild
}