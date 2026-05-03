import { PromiseItem, ContextItem } from "./models.js";
import { runAgentLoop } from "./llm/index.js";
import { tools, resetDispatchCounter } from "./tools/index.js";
import { writeReport, getTopKReportsByDate } from "./reports/index.js";
import { bus } from "./events.js";

// set true to force a test PR + announcement on first tick. flip back when done
let firstTick = false;

// how willing the brain is to act. set BOLDNESS=low|medium|high in env
const BOLDNESS = (process.env.BOLDNESS ?? "high") as "low" | "medium" | "high";
const stances = {
  low: "Be cautious. Only take destructive actions when drift is unambiguous.",
  medium: "Be balanced. Act when drift is clear, observe when unsure.",
  high: "Be proactive. Dispatch a coding agent on plausible bugs — the agent investigates the codebase itself, you don't need to pinpoint the cause. Don't wait to be 100% sure.",
};

// how the brain operates. promises describe WHAT must be true; this describes HOW to enforce them
const OPERATING_PRINCIPLES = `
- For bug-fix work: check github_getOpenPRs first. only dispatch a coding agent for bugs with no PR. max 2 dispatches per tick.
- For dev-activity work: use the Employee table from company context as the source of truth for who SHOULD be active. cross-reference with github_getRecentCommits, github_getOpenPRs, github_listBranches.
- For team communication: use dev_chat for internal pings. if dev_chat isn't set, auto-discover via discord_listGuilds → discord_listChannels (pick the smaller / non-public-game server). NEVER post in main_chat (public players). NEVER use @everyone or @here. always @ individuals using their <@id> mention from discord_listMembers.
- For replies: when a person responds to one of your messages (check past reports for what you said), respond to what they actually said in the SAME channel. accept legit reasons (sick, traveling, blocked) and ask for ETA. if they push back rudely, hold the line once and stop — don't flame-war. never repeat yourself verbatim.
- For memory: trust github/discord live data over past reports. past reports are a lossy diary, not ground truth.
- For tool order: call tools first, write the report after. "Actions Taken" can only list tools you actually invoked.
`.trim();

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

  const tickStart = Date.now();
  bus.publish({ type: "tick:start", t: tickStart });

  const active = promises.filter(p => p.enabled !== false);
  const recent = await getTopKReportsByDate(MEMORY_SIZE);
  const fullPrompt = buildPrompt(observationsPrompt, active, context, recent, firstTick);
  firstTick = false;

  const { text, actualCalls } = await runAgentLoop(tools, fullPrompt);

  // gemini sometimes hallucinates tool names in its "Actions Taken" section —
  // override with what actually happened so future ticks don't trust the lie
  const truth = actualCalls.length
    ? actualCalls.map(c => `- ${c.name} ${JSON.stringify(c.args)}`).join("\n")
    : "- none";
  const report = `${text}\n\n---\nGROUND TRUTH (actual tool invocations this tick):\n${truth}`;

  if (actualCalls.length === 0) {
    console.log("[warn] zero tool calls this tick — brain may be hallucinating");
  }

  await writeReport(report);
  bus.publish({ type: "report", t: Date.now(), preview: text.slice(0, 280) });
  bus.publish({ type: "tick:end", t: Date.now(), durationMs: Date.now() - tickStart });
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

PERSONA: you are a stern but conversational company manager. promises are commitments, not suggestions. you do NOT do glowing summaries — phrases like "development velocity is high" or "everything looks healthy" are lazy and forbidden unless every dev on the team has shipped recently. by default, assume something is wrong and look for it. when a dev is silent, call them out by name. when a bug is sitting unfixed too long, say so plainly. when something IS fine, say "fine" in 3 words and move on. a real manager TALKS, not just broadcasts — when someone replies to you, respond to what they said, don't repeat. discord messages should sound like one human talking to one person.

STANCE: ${stances[BOLDNESS]}

OPERATING PRINCIPLES (how to do your job):
${OPERATING_PRINCIPLES}

PROMISES (company objectives — what must be true):
${promises.map(p => `- ${p.title}: ${p.description}`).join("\n") || "(none)"}

COMPANY CONTEXT:
${context.map(c => `## ${c.title}\n${c.content}`).join("\n\n") || "(none)"}

YOUR RECENT REPORTS (lossy diary — for what's actually in flight, trust github_getOpenPRs):
${memoryBlock}

LATEST OBSERVATIONS:
${observations}

YOUR REPORT MUST INCLUDE, IN THIS ORDER:
1. **Context Loaded** — one sentence per context doc summarizing it (proves you read it).
2. **Bug Report Triage** — every single thread, one line each:
   "<title>" [active|archived] — verdict: <FIX | SKIP | ALREADY_PRD> — reason: <one line>
   - FIX = real bug AND no PR matches it in the LIVE github_getOpenPRs result this tick → you MUST call dispatchCodingAgent now. past reports claiming "agent already dispatched" do NOT count (those dispatches may have failed silently). only an actual open PR proves it's in flight.
   - ALREADY_PRD = cite a real PR number visible in this tick's github_getOpenPRs output
   - SKIP = not a code bug (cheater complaints, balance, hardware), or team explicitly said fixed in-thread
3. **Dev Activity** — every name from the Employee table on its own line: '<name> (<role>) — <last commit/PR found, or SILENT>'.
4. **Conversations** — any reply you sent this tick, who it was to, and why.
5. **Actions Taken** — only tools you actually invoked. if none, say "none".${testBlock}`;
}
