import { Observation, PromiseItem } from "./models.js";
import { emitDrift } from "./tools.js";
import { rollbackDeployment } from "./actions.js";
import { analyzeDriftWithLLM } from "./llm/gemini.js";

// Fallback heuristic for drift detection (used if LLM is unavailable)
// export function detectDriftHeuristic(obs: Observation, promises: PromiseItem[]) {
//   if (obs.type === "player_count" && obs.payload.value === 0) {
//     return {
//       drift: true,
//       promiseIds: ["p1"],
//       action: "rollback",
//       rootCause: "Player count dropped to 0",
//     };
//   }

//   return { drift: false };
// }

export async function handleObservation(observation: Observation, promises: PromiseItem[]) {
  console.log("Brain analyzing...");

  const result = await analyzeDriftWithLLM(observation, promises);

  console.log("Analysis complete:", result);

  if (result.drift) {
    emitDrift(result);

    if (result.action === "rollback") {
      rollbackDeployment();
    }
  }
}