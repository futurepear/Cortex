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
    title: "devs are consistently shipping",
    description: "every active developer should be making commits, opening PRs, or pushing to a branch on a regular cadence (at least once every 5 days). use github_getRecentCommits, github_getOpenPRs, and github_listBranches to check who's been active. cross-reference with discord_listMembers to get the human members. if a known dev hasn't shown activity in 5+ days, post a friendly check-in message in the main chat using discord_sendMessage and @ them with their mention string. don't message anyone you've already pinged in the last week (check past reports). only ping real humans, never bots.",
    sources: ["github", "discord"],
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: randomUUID(),
    title: "discord bug reports get fixed",
    description: "look at every bug report thread in the bug-reports channel — both active AND archived (discord auto-archives threads after inactivity, archived does NOT mean fixed). for each thread, judge whether it's a real code bug that's still unaddressed by reading the messages. SKIP a thread only if: (a) an open PR already addresses it (call github_getOpenPRs first), (b) the team has explicitly said it's fixed, or (c) it's not a code bug at all (e.g. complaints about cheaters, feature requests, generic questions). for every remaining unaddressed bug report, dispatch a coding agent on the main branch — the coding agent can investigate the codebase itself, you don't need to pinpoint the cause. prioritize most recent unfixed bugs first. they will open PRs but not merge.",
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
