import express, { Request, Response } from "express";
import { runAgentLoop } from "../llm/gemini.js";
import { tools } from "../tools/index.js";

const router = express.Router();

router.post("/terminal", async (req: Request, res: Response) => {
  const { prompt } = req.body ?? {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "need prompt" });
  }

  try {
    const text = await runAgentLoop(tools, prompt, 4);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;