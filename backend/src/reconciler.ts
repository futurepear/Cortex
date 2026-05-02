import { Observation, PromiseItem } from "./models.js";
import { emitDrift } from "./tools.js";
import { rollbackDeployment } from "./actions.js";

export function detectDrift(obs: Observation, promises: PromiseItem[]) {
  if (obs.type === "player_count" && obs.payload.value === 0) {
    return {
      drift: true,
      promiseIds: ["p1"],
      action: "rollback",
      rootCause: "Player count dropped to 0",
    };
  }

  return { drift: false };
}

export function handleObservation(obs: Observation, promises: PromiseItem[]) {
  console.log("Processing observation:", obs);

  const result = detectDrift(obs, promises);

  if (result.drift) {
    const drift = {
      promiseIds: result.promiseIds,
      severity: "critical",
      rootCause: result.rootCause,
      action: result.action,
    };

    emitDrift(drift);

    if (result.action === "rollback") {
      rollbackDeployment();
    }
  }
}