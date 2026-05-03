import { ToolRegistry } from "../tools/registry.js";
import { runAgentLoop as gemini } from "./gemini.js";
import { runAgentLoop as claude } from "./claude.js";
import type { AgentResult } from "./gemini.js";

// pick the brain. set MASTER_AGENT=claude in env to use claude (opus by default),
// otherwise gemini-3.1-flash-lite-preview is the default
const MASTER = (process.env.MASTER_AGENT ?? "gemini").toLowerCase();

export async function runAgentLoop(registry: ToolRegistry, prompt: string, maxRounds = 6): Promise<AgentResult> {
  if (MASTER === "claude") return claude(registry, prompt, maxRounds);
  return gemini(registry, prompt, maxRounds);
}
