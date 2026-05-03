import { PromiseItem, ContextItem } from "./models.js";
import { runAgentLoop } from "./llm/gemini.js";
import { tools } from "./tools/index.js";

// set true to force a test PR + announcement on first tick. flip back when done
let firstTick = false;

// how willing the brain is to act. set BOLDNESS=low|medium|high in env
const BOLDNESS = (process.env.BOLDNESS ?? "high") as "low" | "medium" | "high";
const stances = {
  low: "Be cautious. Only take destructive actions (dispatch a coding agent, send a discord message) when drift is unambiguous and you have strong evidence. When in doubt, write a report and observe.",
  medium: "Be balanced. Take destructive actions when drift is clear and you have reasonable confidence. Otherwise observe and report.",
  high: "Be proactive. Err on the side of trying. Dispatch a coding agent on plausible bug reports — the agent can investigate the codebase itself, you don't need to pinpoint the cause first. Send announcements when the team should know. Don't wait to be 100% sure.",
};

export async function reconcileBatch(observationsPrompt: string, promises: PromiseItem[], context: ContextItem[]) {
  if (!observationsPrompt.trim()) {
    console.log("nothing to reconcile");
    return;
  }

  console.log(`brain analyzing... (boldness=${BOLDNESS})`);

  const active = promises.filter(p => p.enabled !== false);
  const fullPrompt = buildPrompt(observationsPrompt, active, context, firstTick);
  firstTick = false;
  const report = await runAgentLoop(tools, fullPrompt);

  console.log("\n=== brain report ===\n" + report + "\n====================");
}

function buildPrompt(observations: string, promises: PromiseItem[], context: ContextItem[], testMode: boolean) {
  const testBlock = testMode ? `

TEST MODE — FIRST RUN ONLY:
Ignore the observations for this one tick. Do these two things, in order:
1. Call dispatchCodingAgent with a task like "make a tiny harmless change as a test, e.g. add a blank line to the README, then open a PR. Do not merge."
2. After the PR is open, call discord_sendAnnouncement with a short funny message about how cortex just opened its first ever PR (one or two lines, be playful). Mention the PR url if you have it.
This is to verify the branch+PR and announcement plumbing works.` : "";

  return `you are cortex, the company brain. your job is to look at fresh observations and check if any company promise has drifted.

STANCE: ${stances[BOLDNESS]}

PROMISES (things that should always be true):
${promises.map(p => `- ${p.title}: ${p.description}`).join("\n") || "(none)"}

COMPANY CONTEXT:
${context.map(c => `## ${c.title}\n${c.content}`).join("\n\n") || "(none)"}

LATEST OBSERVATIONS:
${observations}

if a promise has drifted, investigate using the available tools and act according to your stance above. write a short report at the end explaining what you found and what you did.${testBlock}`;
}
