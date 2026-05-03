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

    extractToolCalls(llmOutput: any): LLMToolCall[] {
        

        const calls: LLMToolCall[] = [];

        if (!llmOutput) return calls;

        // 1) If the payload already contains a top-level tool_calls array
        if (Array.isArray(llmOutput.tool_calls)) {
            for (const c of llmOutput.tool_calls) {
                if (c.function && c.function.name) {
                    calls.push({ id: c.id, type: c.type, function: { name: c.function.name, arguments: c.function.arguments } });
                }
            }
            return calls;
        }

        // 2) OpenAI-style responses: choices[].message.function (or message.function_call)
        const choices = llmOutput.choices ?? llmOutput.response?.choices;
        if (Array.isArray(choices)) {
            for (const choice of choices) {
                const message = choice.message ?? choice;

                // Newer API: message.function.name / message.function.arguments
                if (message.function && message.function.name) {
                    calls.push({ id: choice.id ?? choice.message?.id, type: "function", function: { name: message.function.name, arguments: message.function.arguments ?? "{}" } });
                    continue;
                }

                // Older/openai: message.function_call with name/arguments
                if (message.function_call && message.function_call.name) {
                    calls.push({ id: choice.id, type: "function", function: { name: message.function_call.name, arguments: message.function_call.arguments ?? "{}" } });
                    continue;
                }
            }

            if (calls.length > 0) return calls;
        }

        // 3) Direct function_call at top-level
        if (llmOutput.function_call && llmOutput.function_call.name) {
            calls.push({ type: "function", function: { name: llmOutput.function_call.name, arguments: llmOutput.function_call.arguments ?? "{}" } });
            return calls;
        }

        // 4) Fallback: try to parse a JSON blob from text that contains {"name":"...","arguments":{...}}
        const text = (llmOutput.choices && llmOutput.choices[0] && (llmOutput.choices[0].message?.content ?? llmOutput.choices[0].text)) || llmOutput.text || llmOutput;

        try {
            const maybe = typeof text === "string" ? JSON.parse(text) : text;
            if (maybe && maybe.function && maybe.function.name) {
                calls.push({ type: "function", function: { name: maybe.function.name, arguments: JSON.stringify(maybe.function.arguments ?? {}) } });
                return calls;
            }

            if (maybe && maybe.name) {
                // handle simple shape
                calls.push({ type: "function", function: { name: String(maybe.name), arguments: JSON.stringify(maybe.arguments ?? {}) } });
                return calls;
            }
        } catch {
            // ignore parse errors
        }

        return calls;
    }

    async runFromLLMOutput(llmOutput: any) {
        const calls = this.extractToolCalls(llmOutput);

        if (calls.length === 0) {
            return [];
        }

        return Promise.all(calls.map(call => this.run(call)));
    }
}