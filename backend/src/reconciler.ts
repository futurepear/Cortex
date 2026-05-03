import { Observation, PromiseItem } from "./models.js";
import { emitDrift } from "./tools.js";
import { rollbackDeployment } from "./actions.js";
import { analyzeDriftWithLLM } from "./llm/gemini.js";

export async function reconcileBatch(observations: Observation[], promises: PromiseItem[]) {
  if (observations.length === 0) {
    console.log("Nothing to reconcile.");
    return;
  }

  console.log(`Brain analyzing batch of ${observations.length} observation(s)...`);

  const result = await analyzeDriftWithLLM(observations, promises);

  console.log("Analysis complete:", result);

  if (result.drift) {
    emitDrift(result);

    if (result.action === "rollback") {
      rollbackDeployment();
    }
  }
}
