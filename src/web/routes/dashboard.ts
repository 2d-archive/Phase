import { Route, Router, Get } from "../../lib";
import { Response } from "express-serve-static-core";
import { authenticate } from "passport";
import { Request } from "../server";
import { Permissions } from "discord.js";

@Router("/dashboard")
export default class DashboardRoute extends Route {

	@Get("/", authenticate('discord', { scope: ["identify", "guilds", "email"] })) 
	public redirect(_req: Request, res: Response) {
		return res.redirect("/servers");
	}

	@Get("/servers", (req, res, next) => req.isAuthenticated() ? next() : res.redirect("/failed"))
	public async servers(req: Request, res: Response) {
		res.render("servers", {
			user: req.user,
			guilds: req.user!.guilds!.filter(guild => {
				const permissions = new Permissions(guild.permissions);
				return guild.owner || permissions.has("ADMINISTRATOR");
			})
		});
	}

	@Get("/failed")
	public async failed(req: Request, res: Response) {
		return res.render("failed");
	}
}