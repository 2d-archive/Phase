import { Logger } from "@ayana/logger";
import bodyParser from "body-parser";
import { NextFunction } from "connect";
import pgstore from "connect-pg-simple";
import express from "express";
import { PathParams, Request as ExpressRequest, Response } from "express-serve-static-core";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy, Profile } from "passport-discord";
import { join } from "path";
import { getRouteObject, PhaseClient, PhaserHandler, Route } from "../lib";
import { User } from "../database";

declare module 'passport-discord' {
	interface Profile {
		refreshToken: string;
	}
}

export interface Request extends ExpressRequest {
	user: User & Profile;
}

export class WebServer {
	public app: express.Application = express();
	public modules: Route[] = [];

	public constructor(public client: PhaseClient) { }

	public async init(): Promise<void> {
		this.app.use(express.static(join(process.cwd(), "public/"), { maxAge: 86400000 }));

		this.app.engine("ejs", require("ejs").renderFile);
		this.app.set("view engine", "ejs");

		this.app.use(bodyParser.json({ limit: "5mb" }));
		this.app.use(bodyParser.urlencoded({
			extended: true,
			parameterLimit: 10000,
			limit: "5mb",
		}));

		this.app.use(session({
			store: new (pgstore(session))({
				conObject: {
					database: "phase"
				}
			}),
			secret: process.env.API_SESSION_SECRET!,
			resave: false,
			saveUninitialized: false,
		}));

		passport.use(new DiscordStrategy({
			callbackURL: "/api/callback",
			clientID: "654208999821934603",
			clientSecret: process.env.CLIENT_SECRET!,
			scope: ["identify", "guilds", "email"],
		}, async (accessToken, refreshToken, profile, done) => {
			profile.refreshToken = refreshToken;
			await this.client.db_u.ensure(profile.id).then(user => {
				return done(null, Object.assign(user, profile));
			}, (err) => done(err));
		}));

		passport.serializeUser((user: any, done) => {
			delete user.email;
			done(null, user);
		});
		passport.deserializeUser((id, done) => {
			done(null, id);
		});

		this.app.use(passport.initialize());
		this.app.use(passport.session());

		await this.loadAll();
	}

	public async loadAll(): Promise<void> {
		for (const path of PhaserHandler.walk(join(__dirname, "routes"))) {
			const routeMod: typeof Route = (_ => _.default || _)(require(path)),
				routeInstance = new routeMod(this.client);

			const router = getRouteObject(routeInstance);
			if (!router) return;

			for (const route of router.routes)
				(routeInstance.router[route.method].apply as Function)(
					routeInstance.router,
					[
						route.path,
						...route.handlers,
						async (req: Request, res: Response, next: NextFunction) => {
							try {
								await route.fn.apply(routeInstance, [req, res, next]);
							} catch (error) {
								WebServer.logger.error(error);
								res
									.status(500)
									.json({
										code: 500,
										message: "Sorry, something went wrong."
									})
									.end();
							}
						}
					]
				);

			this.modules.push(Object.assign(routeInstance, { routeObject: router }));
			this.app.use(router.name, routeInstance.router);
		}
	}

	public static logger: Logger = Logger.get(WebServer);
}