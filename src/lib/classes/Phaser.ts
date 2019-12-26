import { PhaseClient } from "../Client";
import { Category } from "./Category";
import { PhaserHandler } from "./Handler";

export interface PhaserOptions {
  category?: string;
  disabled?: boolean;
}

export class Phaser {
  public handler!: PhaserHandler<Phaser>;
  public client!: PhaseClient;
  public path!: string;

  public categoryId: string;
  public category: Category;
  public disabled: boolean;
  
  public constructor(
    public id: string,
    {
      category = "default",
      disabled = false
    }: PhaserOptions = {}
  ) {
    this.categoryId = category;
    this.category = <any> null;
    this.disabled = disabled;
  }

  public async run(...args: any[]): Promise<any> {}

  _init(handler: PhaserHandler<Phaser>, path: string) {
    this.handler = handler;
    this.client = handler.client;
    this.path = path;
  }

  /**
   * Reloads this Phaser.
   *
   * @returns {void}
   * @memberof Phaser
   */
  public reload(): void {
    this.handler.reload(this.id);
  }

  /**
   * Removes this Phaser.
   *
   * @returns {void}
   * @memberof Phaser
   */
  public remove(): void {
    this.handler.remove(this.id);
  }
}