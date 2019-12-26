import { PhaseClient } from "../Client";
import { WebServer } from "../../web/server";
import express from "express";

export class Route {
	public server!: WebServer;
	public router: express.Router = express.Router();
	public constructor(public client: PhaseClient) {}
}
