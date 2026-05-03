import { PromiseItem, ContextItem } from "./models.js";

export const state = {
  context: [] as ContextItem[],
  promises: [] as PromiseItem[],
  paused: false,   // true while the brain is reconciling, used to skip overlapping ticks
};
