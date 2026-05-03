import express, { Request, Response } from "express";
import { dispatchAgent } from "../agent.js";

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
        const result = await dispatchAgent({
            task,
            workdir,
            model,
            abort,
            onText: (text) => send("text", { text }),
            onToolUse: (name, input) => send("tool_use", { name, input }),
        });
        send("result", result);
        send("done", {});
        res.end();
    } catch (err) {
        send("error", { message: err instanceof Error ? err.message : String(err) });
        res.end();
    }
});

export default agentRouter;
