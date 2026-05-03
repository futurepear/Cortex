import { PromiseItem, ContextItem } from "./models.js";
import { runAgentLoop } from "./llm/gemini.js";
import { tools, resetDispatchCounter } from "./tools/index.js";
import { writeReport, getTopKReportsByDate } from "./reports/index.js";

// set true to force a test PR + announcement on first tick. flip back when done
let firstTick = false;

// how willing the brain is to act. set BOLDNESS=low|medium|high in env
const BOLDNESS = (process.env.BOLDNESS ?? "high") as "low" | "medium" | "high";
const stances = {
  low: "Be cautious. Only take destructive actions when drift is unambiguous.",
  medium: "Be balanced. Act when drift is clear, observe when unsure.",
  high: "Be proactive. Dispatch a coding agent on plausible bugs — the agent investigates the codebase itself, you don't need to pinpoint the cause. Don't wait to be 100% sure.",
};

// how many past reports to feed back as memory each tick
const MEMORY_SIZE = 5;

export async function reconcileBatch(observationsPrompt: string, promises: PromiseItem[], context: ContextItem[]) {
  if (!observationsPrompt.trim()) {
    console.log("nothing to reconcile");
    return;
  }

  const titles = context.map(c => c.title).join(", ") || "none";
  console.log(`brain analyzing... (boldness=${BOLDNESS}, context=[${titles}])`);
  resetDispatchCounter();

  const active = promises.filter(p => p.enabled !== false);
  const recent = await getTopKReportsByDate(MEMORY_SIZE);
  const fullPrompt = buildPrompt(observationsPrompt, active, context, recent, firstTick);
  firstTick = false;

  const report = await runAgentLoop(tools, fullPrompt);
  await writeReport(report);
}

function buildPrompt(
  observations: string,
  promises: PromiseItem[],
  context: ContextItem[],
  recentReports: { content: string; modifiedAt: Date }[],
  testMode: boolean,
) {
  const testBlock = testMode ? `

TEST MODE — ignore observations this tick. Call dispatchCodingAgent with a tiny harmless change (e.g. add a blank line to README, open a PR, don't merge). Then call discord_sendAnnouncement with a short funny message about cortex opening its first PR.` : "";

  const memoryBlock = recentReports.length
    ? recentReports.map(r => `[${r.modifiedAt.toISOString()}]\n${r.content}`).join("\n\n---\n\n")
    : "(none yet)";

  return `you are cortex, the company brain. check if any promise has drifted and act on it.

STANCE: ${stances[BOLDNESS]}

PROMISES (things that should always be true):
${promises.map(p => `- ${p.title}: ${p.description}`).join("\n") || "(none)"}

COMPANY CONTEXT:
${context.map(c => `## ${c.title}\n${c.content}`).join("\n\n") || "(none)"}

YOUR RECENT REPORTS (lossy diary — for what's actually in flight, trust github_getOpenPRs):
${memoryBlock}

LATEST OBSERVATIONS:
${observations}

RULES:
- call tools first, write the report after. only list tools you actually invoked.
- max 2 dispatchCodingAgent calls per tick. extra bugs wait for next tick.
- don't dispatch if a real PR already addresses the bug (per github_getOpenPRs).

YOUR REPORT MUST INCLUDE, IN THIS ORDER:
1. **Context Loaded** — one sentence per context doc summarizing it (proves you read it).
2. **Bug Report Triage** — every single thread, one line each:
   "<title>" [active|archived] — verdict: <FIX | SKIP | ALREADY_PRD> — reason: <one line>
   - FIX = real bug, no open PR, AND you actually called dispatchCodingAgent this tick
   - ALREADY_PRD = cite a real PR number from github_getOpenPRs (memory doesn't count)
   - SKIP = not a code bug (cheater complaints, balance, hardware), or team said fixed in-thread
3. **Other Findings** — heroku, GA, main chat, anything else.
4. **Actions Taken** — only tools you actually invoked. if none, say "none".${testBlock}`;
}
