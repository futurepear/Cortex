import express from "express";
import { state } from "../state.js";

const router = express.Router();

// rolling buffer of recent observations the brain has seen. newest last.
// optional ?source=discord to filter
router.get("/observations", (req, res) => {
  const source = String(req.query.source ?? "");
  const items = source
    ? state.observations.filter(o => o.source === source)
    : state.observations;
  res.json(items);
});

export default router;
