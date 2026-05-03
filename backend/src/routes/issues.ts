import express, { Request, Response } from "express";
import { getSortedGitHubIssues } from "../integrations/githubData.js";

const router = express.Router();

router.get("/issues", async (_req: Request, res: Response) => {
  try {
    const issuesData = await getSortedGitHubIssues();
    res.json(issuesData.data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
