import Logger from "@ayana/logger";
import { FileSystemError, IllegalArgumentError, IllegalStateError } from "@ayanaware/errors";
import Collection from "@discordjs/collection";
import { EventEmitter } from "events";
import { readdirSync, statSync } from "fs";
import { dirname, extname, join, sep, resolve } from "path";
import { PhaserHandlerEvents } from "../../util/Constants";
import { PhaseClient } from "../Client";
import { Category } from "./Category";
import { Phaser } from "./Phaser";

export type LoadPredicate = (path: string) => boolean;
export interface HandlerOptions {
	extensions?: string[];
	directory?: string;
	automateCategories?: boolean;
	filter?: LoadPredicate;
	handles?: Function;
}

export class PhaserHandler<T extends Phaser> extends EventEmitter {
	public modules: Collection<string, T> = new Collection();
	public categories: Collection<string, Category> = new Collection();
	public static logger: Logger = Logger.get(PhaserHandler);

	public readonly extensions: Set<string>;
	public readonly directory: string;
	public readonly automateCategories: boolean;
	public readonly handles: Function;
	public readonly filter: LoadPredicate;

	public constructor(
		public client: PhaseClient,
		{
			extensions = ['.js', '.json', '.ts'],
			directory,
			automateCategories = false,
			handles = Phaser,
			filter = (() => true)
		}: HandlerOptions) {
		super();

		this.extensions = new Set(extensions);
		this.directory = String(directory);
		this.automateCategories = automateCategories;
		this.handles = handles;
		this.filter = filter;
	}

	/**T
	 * Registers a module.
   * @param {T} mod - Module to use.
   * @param {string} [path] - File path of module.
   * @returns {void}
   */
	public register(mod: T, path: string) {
		mod._init(this, path)
		this.modules.set(mod.id, mod);

		if (mod.categoryId === 'default' && this.automateCategories) {
			const dirs = dirname(path).split(sep);
			mod.categoryId = dirs[dirs.length - 1];
		}

		let category = <Category>this.categories.get(mod.categoryId);
		if (!this.categories.has(mod.categoryId)) {
			category = new Category(mod.categoryId)
			this.categories.set(mod.categoryId, category);
		}

		mod.category = category;
		category.set(mod.id, mod);
	}

	/**
	 * Reads all modules from a directory and loads them.
	 * @param {string} [directory] - Directory to load from.
	 * Defaults to the directory passed in the constructor.
	 * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
	 * Defaults to the filter passed in the constructor.
	 * @returns {AkairoHandler}
	 */
	public loadAll(directory: string = this.directory, filter: LoadPredicate = this.filter) {
		const filepaths = PhaserHandler.walk(directory);
		for (let filepath of filepaths) {
			filepath = resolve(filepath);
			if (filter(filepath)) this.load(filepath);
		}
	}

	/**
	 * Deregisters a module.
	 * @param {T} mod - The phaser to deregister.
	 */
	public deregister(mod: T): void {
		if (mod.path) delete require.cache[require.resolve(mod.path)];
		this.modules.delete(mod.id);
		mod.category.delete(mod.id);
	}

	public load(
		thing: any,
		isReload: boolean = false
	): T {
		try {
			const isClass = typeof thing === 'function';
			if (!isClass && !this.extensions.has(extname(thing)))
				throw new FileSystemError(`"${isClass ? thing.name : thing}" isn't a class, or doesn't abide by the accepted extensions.`);

			let mod = isClass
				? thing
				: function findExport(this: any, m: any): Function | null {
					if (!m) return null;
					if (m.prototype instanceof this.handles) return m;
					return m.default ? findExport.call(this, m.default) : null;
				}.call(this, require(thing));

			if (mod && mod.prototype instanceof Phaser) {
				mod = new mod(this); // eslint-disable-line new-cap
			} else {
				if (!isClass) delete require.cache[require.resolve(thing)];
				throw new FileSystemError(`"${mod.name}" isn't of type "${this.handles.name}".`);
			}

			if (this.modules.has(mod.id)) throw new IllegalStateError(`"${mod.id}" is already loaded.`);

			this.register(mod, isClass ? null : thing);
			this.emit(PhaserHandlerEvents.LOAD, mod, isReload);

			return mod;
		} catch (e) {
			PhaserHandler.logger.error(
				new FileSystemError(`Couldn't load "${typeof thing === "function" ? thing.name : thing}"`)
					.setCause(e)
			);
			return thing;
		}
	}

	/**
		* Removes a module.
		* @param {string} id - ID of the module.
		* @returns {T}
		*/
	public remove(id: string): T {
		const mod = this.modules.get(id.toString());
		if (!mod) throw new IllegalArgumentError(`Phaser with ID "${id}" doesn't exist.`);

		this.deregister(mod);

		this.emit(PhaserHandlerEvents.REMOVE, mod);
		return mod;
	}

	/**
	 * Removes all modules.
	 * @returns {AkairoHandler}
	 */
	public removeAll() {
		for (const m of Array.from(this.modules.values())) {
			if (m.path) this.remove(m.id);
		}

		return this;
	}

	/**
	 * Reloads a module.
	 * @param {string} id - ID of the module.
	 * @returns {T}
	 */
	public reload(id: string): T {
		const mod = this.modules.get(id.toString());
		if (!mod) throw new IllegalArgumentError(`Phaser with ID "${id}" doesn't exist.`);
		if (!mod.path) throw new IllegalArgumentError(`Phaser with ID "${id}" can't be reloaded.`);

		this.deregister(mod);

		const path = mod.path;
		const newMod = this.load(path, true);
		return newMod;
	}

	/**
	 * Reloads all modules.
	 * @returns {PhaserHandler}
	 * 
	 */
	public reloadAll() {
		for (const m of Array.from(this.modules.values())) {
			if (m.path) this.reload(m.id);
		}

		return this;
	}

	/**
	 * Reads files recursively from a directory.
	 * @param {string} directory - Directory to read.
	 * @returns {string[]} - An array of file paths.
	 */
	public static walk(directory: string): string[] {
		const result = [];
		(function read(dir) {
			const files = readdirSync(dir);
			for (const file of files) {
				const filepath = join(dir, file);
				if (statSync(filepath).isDirectory()) read(filepath);
				else result.push(filepath)
			}
		}(directory));
		return result;
	}


}