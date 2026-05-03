import { PromiseItem, ContextItem } from "./models.js";
import { runAgentLoop } from "./llm/gemini.js";
import { tools } from "./tools/index.js";

// set true to force a test PR + announcement on first tick. flip back when done
let firstTick = true;

export async function reconcileBatch(observationsPrompt: string, promises: PromiseItem[], context: ContextItem[]) {
  if (!observationsPrompt.trim()) {
    console.log("nothing to reconcile");
    return;
  }

  console.log("brain analyzing...");

  const fullPrompt = buildPrompt(observationsPrompt, promises, context, firstTick);
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

PROMISES (things that should always be true):
${promises.map(p => `- ${p.title}: ${p.description}`).join("\n") || "(none)"}

COMPANY CONTEXT:
${context.map(c => `## ${c.title}\n${c.content}`).join("\n\n") || "(none)"}

LATEST OBSERVATIONS:
${observations}

if a promise has drifted, investigate using the available tools, then write a short report explaining what's wrong and what to do. if you decide to take a destructive action like sending a discord announcement, only do it when you're sure. if everything looks fine, just say so.${testBlock}`;
}
