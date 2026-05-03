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
    title: "discord bug reports get fixed",
    description: "for every unresolved bug report in the bug-reports channel, dispatch a coding agent on the main branch to investigate and attempt a fix. err on the side of trying — the coding agent can read the codebase itself, you don't need to pinpoint the cause first. one agent dispatch per bug report. they will open PRs but not merge.",
    sources: ["discord"],
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
