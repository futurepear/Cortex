import { query } from "@anthropic-ai/claude-agent-sdk";

export interface DispatchOptions {
    task: string;
    workdir: string;
    model?: string;
    abort?: AbortController;
    onText?: (text: string) => void;
    onToolUse?: (name: string, input: unknown) => void;
}

export interface DispatchResult {
    text: string;
    toolUses: { name: string; input: unknown }[];
}

export async function dispatchAgent(opts: DispatchOptions): Promise<DispatchResult> {
    const { task, workdir, model, abort, onText, onToolUse } = opts;

    const collected: DispatchResult = { text: "", toolUses: [] };

    for await (const message of query({
        prompt: task,
        options: {
            abortController: abort,
            allowedTools: ["Read", "Edit", "Bash"],
            cwd: workdir,
            model: model ?? "claude-haiku-4-5",
            permissionMode: "bypassPermissions",
            pathToClaudeCodeExecutable: process.env.CLAUDE_CODE_PATH,
            systemPrompt: `Only work in ${workdir} you may not read or write outside ${workdir}!`,
        },
    })) {
        if (message.type === "assistant") {
            for (const block of message.message.content) {
                if (block.type === "text") {
                    collected.text += block.text;
                    onText?.(block.text);
                }
                if (block.type === "tool_use") {
                    collected.toolUses.push({ name: block.name, input: block.input });
                    onToolUse?.(block.name, block.input);
                }
            }
        }
    }

    return collected;
}
