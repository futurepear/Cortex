import express, { Request, Response } from "express";
import { query } from "@anthropic-ai/claude-agent-sdk";

const agentRouter = express.Router();

interface AgentRequestBody {
    model?: string;
    task: string;
    workdir: string;
}

agentRouter.post("/agents/dispatch", async (req: Request<{}, {}, AgentRequestBody>, res: Response) => {
    const { model, task, workdir } = req.body;

    if (!task || !workdir) {
        return res.status(400).json({ error: "task and workdir are required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const send = (event: string, data: unknown) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const abort = new AbortController();
    req.on("close", () => abort.abort());

    try {
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
                    if (block.type === "text") send("text", { text: block.text });
                    if (block.type === "tool_use") send("tool_use", { name: block.name, input: block.input });
                }
            } else if (message.type === "result") {
                send("result", message);
            }
        }
        send("done", {});
        res.end();
    } catch (err) {
        send("error", { message: err instanceof Error ? err.message : String(err) });
        res.end();
    }
});

export default agentRouter;
