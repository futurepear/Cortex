// IDK WHY WE NEED THIS!


import { state } from "./state.js";

export function getPromises() {
  return state.promises;
}

export function getObservations() {
  return state.observations;
}

export function emitDrift(drift: any) {
  state.drifts.push(drift);
  console.log("DRIFT EMITTED:", drift);
}