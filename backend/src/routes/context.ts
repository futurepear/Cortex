import express, { Request, Response } from "express";
import { state } from "../state.js";
import { addContextDoc, removeContextDoc } from "../context.js";
import { fetchGoogleDoc } from "../integrations/googleDocs.js";

const router = express.Router();

router.get("/context", (_req, res) => {
  res.json(state.context);
});

router.post("/context", async (req: Request, res: Response) => {
  const { docId } = req.body ?? {};
  if (!docId) return res.status(400).json({ error: "need docId" });
  try {
    const { title, content } = await fetchGoogleDoc(docId);
    const created = addContextDoc({ title, content });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.delete("/context/:id", (req: Request, res: Response) => {
  const ok = removeContextDoc(String(req.params.id));
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

export default router;
