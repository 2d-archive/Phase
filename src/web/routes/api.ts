import { Request, Response } from "express-serve-static-core";
import { Get, Route, Router, Use } from "../../lib/api";
import { authenticate } from "passport"

@Router("/api")
export default class API extends Route {
	@Get()
	public async get(_req: Request, res: Response) {
		return res
			.status(200)
			.json({
				code: 200,
				message: `Phase v${process.env.VERSION}`,
				stats: {
					guilds: this.client.guilds.size,
					users: this.client.users.size,
					uptime: this.client.uptime
				}
			})
			.end();
	}

	@Get("/logout", (req, res, next) => req.isAuthenticated() ? next() : res.redirect("../"))
	public async logout(req: Request, res: Response) {
		await req.logout();
		return res.redirect("../");
	}

	@Get("/callback", authenticate('discord', { failureRedirect: "../" }))
	public async callback(_req: Request, res: Response) {
		res.redirect("../dashboard/servers");
	}
}