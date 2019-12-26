import { Router, Get, Route } from "../../lib";
import { Request } from "../server";
import { Response } from "express-serve-static-core";

@Router("/")
export default class Website extends Route {
	
	@Get()
	public async get(req: Request, res: Response) {
		return res
			.status(200)
			.render("index", {
				authenticated: req.isAuthenticated(),
				user: req.user
			});
	}
}