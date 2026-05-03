import { Observation, PromiseItem, Drift, ContextItem } from "./models.js";

export const state = {
  context: [] as ContextItem[],
  promises: [] as PromiseItem[],
  observations: [] as Observation[],   // full history
  observationQueue: [] as Observation[], // waiting on next reconcile
  drifts: [] as Drift[],
  paused: false,                         // true while the brain is reconciling, drops new observations
};

// returns false if the brain is busy and we dropped this one
export function addObservation(o: Observation): boolean {
  if (state.paused) return false;
  state.observations.push(o);
  state.observationQueue.push(o);
  return true;
}

export function drainObservations(): Observation[] {
  const batch = state.observationQueue;
  state.observationQueue = [];
  return batch;
}

export function addDrift(d: Drift) {
  state.drifts.push(d);
}
