import type { PromiseItem } from "../../backend/src/models";

export const MOCK_PROMISES: PromiseItem[] = [
  {
    id: "id place",
    title: "app stays up",
    description: "no spike in 5xx errors or repeated crashes in logs",
    sources: ["heroku"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "DAU stability",
    description: "daily active users should not drop more than 20% day over day",
    sources: ["ga4"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "latency threshold",
    description: "p95 API response time must remain under 300ms",
    sources: ["api-gateway"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "error rate control",
    description: "total error rate must stay below 1% across all services",
    sources: ["sentry"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "database health",
    description: "no long-running locks or deadlocks in primary DB",
    sources: ["postgres"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "cache efficiency",
    description: "redis cache hit rate should remain above 90%",
    sources: ["redis"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "frontend stability",
    description: "no unhandled runtime errors in production builds",
    sources: ["sentry"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "auth integrity",
    description: "no unauthorized session bypass attempts detected",
    sources: ["auth-service"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "deployment safety",
    description: "all deployments must pass CI before production release",
    sources: ["github-actions"],
    createdAt: Date.now(),
  },
  {
    id: "id place",
    title: "system load",
    description: "CPU usage should stay under 75% under normal traffic",
    sources: ["monitoring"],
    createdAt: Date.now(),
  },
];
