import type { Observation } from "../../backend/src/models";

export const MOCK_OBSERVATIONS: Observation[] = [
  {
    source: "telemetry",
    type: "cpu_usage",
    payload: {
      value: 72,
      unit: "percent",
    },
    timestamp: Date.now(),
  },
  {
    source: "api-gateway",
    type: "request_latency",
    payload: {
      p95: 310,
      p99: 520,
      unit: "ms",
    },
    timestamp: Date.now() - 5000,
  },
  {
    source: "database",
    type: "connection_pool",
    payload: {
      active: 18,
      idle: 7,
      max: 25,
    }
  },
];
