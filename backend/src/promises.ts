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
    description: "every developer on the team should be committing, opening PRs, or pushing branches at least once every 5 days. STEP 1: open the 'Employee table' tab in the company context. extract EVERY person listed there with their role — that's the team roster, ground truth. STEP 2: get recent activity via github_getRecentCommits, github_getOpenPRs, github_listBranches. STEP 3: in your final report, include a 'Dev Activity' subsection inside 'Other Findings' that lists EVERY single name from the Employee table on its own line in this exact format: '<name> (<role>) — <last commit/PR found, or SILENT>'. you must list every person, no summarizing. anyone marked SILENT is failing the promise. STEP 4: for the silent ones, find the dev discord server. if dev_chat is set in KNOWN CHANNEL IDS, use it. otherwise call discord_listGuilds and pick the one that isn't the public game server (smaller, name like 'dev'/'team'/'internal'/'staff'). then discord_listChannels on it for a general/dev channel. STEP 5: discord_listMembers on the dev guild, fuzzy-match each silent dev's name, and discord_sendMessage them individually with their <@id> mention. one message per silent dev. NEVER post in main_chat (public). NEVER @everyone/@here. STEP 6: skip pinging anyone you already pinged this week (check past reports).",
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
