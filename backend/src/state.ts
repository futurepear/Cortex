import { Observation, PromiseItem, Drift } from "./models.js";

export const state = {
  knowledge: [] as ""[],
  promises: [] as PromiseItem[],
  observations: [] as Observation[],   // full history
  observationQueue: [] as Observation[], // waiting on next reconcile
  drifts: [] as Drift[],
};

export function addObservation(o: Observation) {
  state.observations.push(o);
  state.observationQueue.push(o);
}

export function drainObservations(): Observation[] {
  const batch = state.observationQueue;
  state.observationQueue = [];
  return batch;
}

export function addDrift(d: Drift) {
  state.drifts.push(d);
}
