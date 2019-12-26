import Logger from "@ayana/logger";
import { Client } from "discord.js";
import figlet from "figlet";
import { SharderEvents, ShardingManager } from "kurasuta";
import { join } from "path";
import "reflect-metadata";
import { PhaseClient } from "./lib";
import "./util/Formatter";

require("dotenv").config({ path: join(process.cwd(), ".env") });

const log = Logger.get("Sharder");
const sharder = new ShardingManager(join(__dirname, "phase.js"), {
  client: <typeof Client><unknown>PhaseClient,
  development: (process.env.NODE_ENV || "development").toLowerCase() === "development"
    ? true
    : false,
  token: process.env.CLIENT_TOKEN,
  shardCount: "auto"
});


let finished = 0;
sharder.on(SharderEvents.SHARD_READY, async (id: number) => {
  finished++;
  log.info(`Shard [${id}] is now ready...`);
  if (finished === sharder.shardCount) {
    await figlet("Phase", (err, result) => {
      if (err) return log.error(err);
      (result as string).split("\n").forEach((line) => {
        log.info(`\u001b[1m\u001b[35m${line}\u001b[39m\u001b[22m`);
      })
    });
    log.info(`Phase v${process.env.VERSION} is now online!`);
  }
});

sharder.on(SharderEvents.SHARD_DISCONNECT, (event, id) => {
  log.warn(`Shard [${id}] disconnected with the code "${event.code}" for reason "${event.reason}"`)
});

sharder.on(SharderEvents.SHARD_RECONNECT, (id) => {
  log.info(`Shard [${id}] is now reconnecting...`);
});

sharder.spawn();