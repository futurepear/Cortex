import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PromiseItem } from "./models.js";
import { state } from "./state.js";

const FILE = process.env.PROMISES_FILE || "promises.json";

// shipped on first boot if there's no file yet. user can delete or add to these
const SEED: PromiseItem[] = [
  {
    id: randomUUID(),
    title: "app stays up",
    description: "no spike in 5xx errors or repeated crashes in the heroku logs",
    sources: ["heroku"],
    createdAt: Date.now(),
  },
  {
    id: randomUUID(),
    title: "DAU doesn't crater",
    description: "daily active users shouldn't drop more than 30% day over day",
    sources: ["ga4"],
    createdAt: Date.now(),
  },
  {
    id: randomUUID(),
    title: "every dev ships at least every 5 days",
    description: "every developer listed in the company Employee table should have a commit, PR, or branch push within the last 5 days",
    sources: ["github", "discord"],
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: randomUUID(),
    title: "bug reports get addressed within 5 days",
    description: "every unresolved bug report in the bug-reports forum should either have an open PR or be triaged within 5 days. archived ≠ resolved.",
    sources: ["discord", "github"],
    enabled: true,
    createdAt: Date.now(),
  },
];

export function loadPromises(): PromiseItem[] {
  if (!existsSync(FILE)) {
    writeFileSync(FILE, JSON.stringify(SEED, null, 2));
    return SEED;
  }
  return JSON.parse(readFileSync(FILE, "utf8"));
}

function save() {
  writeFileSync(FILE, JSON.stringify(state.promises, null, 2));
}

export function addPromise(p: Omit<PromiseItem, "id" | "createdAt">): PromiseItem {
  const promise: PromiseItem = { ...p, id: randomUUID(), createdAt: Date.now() };
  state.promises.push(promise);
  save();
  return promise;
}

export function removePromise(id: string): boolean {
  const before = state.promises.length;
  state.promises = state.promises.filter(p => p.id !== id);
  if (state.promises.length === before) return false;
  save();
  return true;
}
