import { PromiseItem } from "./models.js";
import { emitDrift } from "./tools.js";
import { rollbackDeployment } from "./actions.js";
import { analyzeDriftWithLLM } from "./llm/gemini.js";

export async function reconcileBatch(prompt: string, promises: PromiseItem[]) {
  if (!prompt.trim()) {
    console.log("Nothing to reconcile.");
    return;
  }

  console.log("Brain analyzing observation batch...");

  const result = await analyzeDriftWithLLM(prompt, promises);

  console.log("Analysis complete:", result);

  if (result.drift) {
    emitDrift(result);

    if (result.action === "rollback") {
      rollbackDeployment();
    }
  }
}
