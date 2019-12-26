import { Command } from "./Command";

export class SubCommands {
  public parent: Command;
  public children: string[];

  public constructor(parent: Command, children: string[] = []) {
    this.parent = parent;
    this.children = children;

    if (children.length > 0 && !children.some(_ => {
      const command = parent.handler.modules.get(_)
      if (command && command.childof === parent.id) return true;
      return false;
    })) {
      throw new RangeError("These sub-commands don't exist")
    }
  }

  public resolve(id: string): Command {
    if (this.children.includes(id))
      throw new Error("Sorry, that isn't a sub-command.");
    
    const result = this.parent.handler.modules.get(id);
    return <Command> result;
  }
}