import { PromiseItem } from "./models.js";
import { runAgentLoop } from "./llm/gemini.js";
import { tools } from "./tools/index.js";

export async function reconcileBatch(observationsPrompt: string, promises: PromiseItem[]) {
  if (!observationsPrompt.trim()) {
    console.log("nothing to reconcile");
    return;
  }

  console.log("brain analyzing...");

  const fullPrompt = buildPrompt(observationsPrompt, promises);
  const report = await runAgentLoop(tools, fullPrompt);

  console.log("\n=== brain report ===\n" + report + "\n====================");
}

function buildPrompt(observations: string, promises: PromiseItem[]) {
  return `you are cortex, the company brain. your job is to look at fresh observations and check if any company promise has drifted.

PROMISES (things that should always be true):
${promises.map(p => `- ${p.title}: ${p.description}`).join("\n") || "(none)"}

LATEST OBSERVATIONS:
${observations}

if a promise has drifted, investigate using the available tools, then write a short report explaining what's wrong and what to do. if you decide to take a destructive action like sending a discord announcement, only do it when you're sure. if everything looks fine, just say so.`;
}
