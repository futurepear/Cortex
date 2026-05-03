import { Observation, PromiseItem, Drift } from "./models.js";

export const state = {
  promises: [] as PromiseItem[],
  observations: [] as Observation[],
  drifts: [] as Drift[],
};

export function addObservation(o: Observation) {
  state.observations.push(o);
}

export function addDrift(d: Drift) {
  state.drifts.push(d);
}

