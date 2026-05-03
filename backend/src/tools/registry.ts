type ToolFn<TArgs = any, TResult = any> = (args: TArgs) => Promise<TResult> | TResult;

type ToolDef<TArgs = any, TResult = any> = {
    name: string;
    description?: string;
    parameters?: object; // JSON schema for the LLM
    execute: ToolFn<TArgs, TResult>;
};

type LLMToolCall = {
    id?: string;
    type?: "function";
    function: {
        name: string;
        arguments: string;
    };
};

export class ToolRegistry {
    private tools = new Map<string, ToolDef>();

    register(tool: ToolDef) {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool already registered: ${tool.name}`);
        }

        this.tools.set(tool.name, tool);
        return this;
    }

    getSchemas() {
        return [...this.tools.values()].map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description ?? "",
                parameters: tool.parameters ?? {
                    type: "object",
                    properties: {},
                    additionalProperties: false,
                },
            },
        }));
    }

    async run(call: LLMToolCall) {
        const name = call.function.name;
        const tool = this.tools.get(name);

        if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
        }

        let args: unknown;

        try {
            args = JSON.parse(call.function.arguments || "{}");
        } catch {
            throw new Error(`Invalid JSON arguments for tool: ${name}`);
        }

        const result = await tool.execute(args);

        return {
            tool_call_id: call.id,
            name,
            result,
        };
    }
}