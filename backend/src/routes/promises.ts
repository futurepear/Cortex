import express, { Request, Response } from "express";
import { state } from "../state.js";
import { addPromise, removePromise } from "../promises.js";

const router = express.Router();

router.get("/promises", (_req, res) => {
  res.json(state.promises);
});

router.post("/promises", (req: Request, res: Response) => {
  const { title, description, sources } = req.body ?? {};
  if (!title || !description) {
    return res.status(400).json({ error: "need title and description" });
  }
  const created = addPromise({ title, description, sources });
  res.status(201).json(created);
});

router.delete("/promises/:id", (req: Request, res: Response) => {
  const ok = removePromise(String(req.params.id));
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

export default router;
