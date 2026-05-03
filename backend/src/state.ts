import { PromiseItem, ContextItem, Observation } from "./models.js";

export const state = {
  context: [] as ContextItem[],
  promises: [] as PromiseItem[],
  // rolling buffer of recent observations for the frontend feed. keep it bounded
  observations: [] as Observation[],
  paused: false,   // true while the brain is reconciling, used to skip overlapping ticks
};

const MAX_OBSERVATIONS = 200;
export function pushObservation(o: Observation) {
  state.observations.push(o);
  if (state.observations.length > MAX_OBSERVATIONS) {
    state.observations.splice(0, state.observations.length - MAX_OBSERVATIONS);
  }
}
