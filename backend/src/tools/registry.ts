// a tool is something the LLM can call
export type Tool = {
  name: string;
  description: string;
  parameters: object;                          // json schema
  execute: (args: any) => Promise<any> | any;
};

export class ToolRegistry {
  private tools = new Map<string, Tool>();

  register(t: Tool) {
    this.tools.set(t.name, t);
    return this;
  }

  list(): Tool[] {
    return [...this.tools.values()];
  }

  async run(name: string, args: any) {
    const t = this.tools.get(name);
    if (!t) throw new Error(`unknown tool: ${name}`);
    return t.execute(args ?? {});
  }
}
