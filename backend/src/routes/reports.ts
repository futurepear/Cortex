import express from "express";
import { getTopKReportsByDate } from "../reports/index.js";

const router = express.Router();

// returns the most recent N brain reports (default 5)
router.get("/reports", async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const reports = await getTopKReportsByDate(limit);
  res.json(reports.map(r => ({
    file: r.file,
    createdAt: r.createdAt,
    modifiedAt: r.modifiedAt,
    content: r.content,
  })));
});

export default router;
