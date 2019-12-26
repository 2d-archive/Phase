export const BuilderCache: Map<string, any[][]> = new Map();
export type Method<R> = (str: any, index: number, strings: any[]) => R;
export type Params =
  "split"
  | "disable:plugin"
  | "disable:mapper"
  | "disable:filter"
export interface StringBuilderOptions {
  filter?: Method<boolean>;
  mapper?: Method<any>;
  plugin?: typeof CodePlugin
  seperator?: string;
}

export default class StringBuilder<T extends any = string> {
  public stored: T[][] = []
  public current: T[] = [];
  public seperator: string;
  public methods: {
    filter: Method<boolean>;
    mapper: Method<any>;
  };

  public constructor({
    filter = (() => true),
    mapper = ((_) => _),
    seperator = "\n"
  }: StringBuilderOptions = {}) {
    this.seperator = seperator;
    this.methods = { filter, mapper }
  }

  public cache(key: string): Map<string, (T[])[]> {
    if (BuilderCache.has(key)) return BuilderCache;
    BuilderCache.set(key, [...this.stored, this.current]);
    this.stored = [], this.current = [];
    return BuilderCache;
  }

  public append(content: any, ...parameters: Params[]): this {
    if (!parameters.includes("disable:filter")) this.methods.filter(content, this.current.length + 1, this.current);
    this.current.push(content);

    if (!parameters.some(p => ["split", "split&build"].includes(p))) return this;
    if (parameters.includes("split")) this.stored.push(this.current), this.current = [];
    return this;
  }

  public split(...parameters: Params[]): this {
    const position = this.stored.push(this.current);
    // @ts-ignore
    this.stored[`${position}-parameters`] = parameters;
    this.current = [];
    return this;
  }

  public build(plugin?: Function): string {
    let result = [];
    if (this.current.length > 0) this.split();


    if (!plugin)
      this.stored.forEach((partition: any[], position: number) => {
        // @ts-ignore
        const params = this.stored[`${(Number(position) + 1)}-parameters`] as Params[];

        if (!params.includes("disable:mapper"))
          partition = partition
            .filter(s => typeof s === "string" ? !s.startsWith("($!#)") : true)
            .map(this.methods.mapper);

        for (let pos in partition)
          if (partition[pos].startsWith("($!#)"))
            partition[pos] = partition[pos].replace("($!#)", "");

        result.push(partition.join(this.seperator));
      })
    else result = plugin(this);

    return result.join(this.seperator);
  }
}

export class CodePlugin {
  public static build(strings: string[], ...[language]: any[]) {
    strings.unshift(`($!#)\`\`\`${language}\n`)
    strings.push(`($!#)\n\`\`\``);
    return strings;
  }
}

export const PLUGINS = {
  prolog: (builder: StringBuilder<string[]>): string[] => {
    const result: string[] = [];
    builder.stored.forEach((partition, position) => {
      const mapped = partition.map((arr, _index, strings) => {
        return ((str: string[]) => [
          str[0].padStart(partition.reduce((base, a) => Math.max(base, a[0].length), 0)),
          `${str[1]}`
        ].join(" : "))(arr)
      });

      result.push(`\`\`\`prolog\n${mapped.join("\n")}\n\`\`\``);
    });
    return result;
  }
}