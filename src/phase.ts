import { BaseCluster } from "kurasuta";
import { join } from "path";
import "reflect-metadata";
import { Database } from "./database";
import { PhaseClient } from "./lib";
import "./util/Formatter";

require("dotenv").config({ path: join(process.cwd(), ".env") });

export default class Phase extends BaseCluster {
  protected async launch(client = <PhaseClient>this.client): Promise<void> {
    const database = new Database();
    await database.init();

    client.setup({ ownerList: ["396096412116320258"] });
    await client.login(process.env.CLIENT_TOKEN);

    process.on("SIGINT", () => {
      for (const [id, { node }] of client.andesite.players)
        node.leave(id);
      client.logger.trace("Disconnected Players.");
      process.exit(0)
    });
  }
}