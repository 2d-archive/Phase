import { Collection } from "discord.js";
import { Command } from "../command/Command";
import { Phaser } from "./Phaser";

/**
 * A class representing a command category.
 * @extends {Collection}
 */
export class Category extends Collection<string, Phaser> {
  /**
   * The category ID (name).
   *
   * @type {string}
   * @memberof Category
   */
  public id: string;

  /**
   * Creates an instance of Category.
   * @param {string} id
   * @param {Iterable} iterable
   * @memberof Category
   */
  public constructor(id: string, iterable?: (readonly [string, Phaser])[]) {
    super(iterable);
    this.id = id;
  }

  /**
   * Reloads all of the phasers.
   * @return {void}
   * @memberof Category
   */
  public reloadAll() {
    for (const [, _] of this) 
      if (_.path) _.reload();
  }

  /**
   * Removes all the commands in this category.
   * @returns {void}
   * @memberof Category
   */
  public removeAll() {
    for (const [, _] of this)
      if (_.path) _.remove();
  }
}