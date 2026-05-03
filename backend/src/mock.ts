import { Observation, PromiseItem } from "./models.js";

export const PROMISES: PromiseItem[] = [
  {
    id: "p1",
    title: "Players must always be > 0",
    // category: "slo",
  },
];

export const OBSERVATIONS: Observation[] = [
  {
    source: "telemetry",
    type: "player_count",
    payload: { value: 0 },
  },
];