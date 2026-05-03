import { addObservation } from "./state.js";
import {
  init as initIntegrations,
  getGitHubCommits,
  getGitHubIssues,
  getGitHubRepoStats,
  getCoreStats,
  getDAU,
  getRawHerokuRecentLogs,
  watchHerokuLogs,
  startDiscordBot,
  getNewMessages,
} from "./integrations/index.js";
import { OBSERVATIONS } from "./mock.js";

const useReal = process.env.USE_REAL_OBSERVATIONS === "true";

// poll cadences in ms
const GITHUB_POLL_MS = Number(process.env.GITHUB_POLL_MS) || 30_000;
const GITHUB_STATS_POLL_MS = Number(process.env.GITHUB_STATS_POLL_MS) || 5 * 60_000;
const GA_POLL_MS = Number(process.env.GA_POLL_MS) || 60_000;
const DISCORD_POLL_MS = Number(process.env.DISCORD_POLL_MS) || 15_000;

function push(source: string, type: string, payload: any) {
  addObservation({ source, type, payload, timestamp: Date.now() });
}

// run a source call, log if it blows up but don't kill the loop
async function safe(label: string, fn: () => Promise<any>) {
  try {
    return await fn();
  } catch (err) {
    console.error(`[obs:${label}]`, (err as Error).message);
    return null;
  }
}

function startMock() {
  let i = 0;
  setInterval(() => {
    const obs = OBSERVATIONS[i % OBSERVATIONS.length];
    i++;
    addObservation(obs);
    console.log("[obs:mock] queued", obs);
  }, 2_000);
}

async function startReal() {
  // best-effort startup. if oauth or discord fails the rest still run
  await safe("init:google", () => initIntegrations());
  await safe("init:discord", async () => { await startDiscordBot(); });

  pollGitHub();
  pollGA();
  pollDiscord();
  streamHeroku();
}

function pollGitHub() {
  let lastSha: string | null = null;
  let lastIssue: number | null = null;

  setInterval(async () => {
    await safe("gh:commits", async () => {
      const block = await getGitHubCommits();
      const commits = (block.data as any[]) ?? [];
      // take everything above the cursor
      const idx = lastSha ? commits.findIndex(c => c.sha === lastSha) : -1;
      const fresh = idx === -1 ? commits : commits.slice(0, idx);
      if (fresh.length) {
        push("github", "new_commits", { commits: fresh });
        lastSha = commits[0].sha;
      }
    });

    await safe("gh:issues", async () => {
      const block = await getGitHubIssues(30);
      const issues = (block.data as any[]) ?? [];
      const idx = lastIssue !== null ? issues.findIndex(i => i.number === lastIssue) : -1;
      const fresh = idx === -1 ? issues : issues.slice(0, idx);
      if (fresh.length) {
        push("github", "issue_updates", { issues: fresh });
        lastIssue = issues[0].number;
      }
    });
  }, GITHUB_POLL_MS);

  // repo-wide stats are slow-moving, no point hammering them
  setInterval(async () => {
    await safe("gh:repo_stats", async () => {
      const block = await getGitHubRepoStats();
      push("github", "repo_stats", block.data);
    });
  }, GITHUB_STATS_POLL_MS);
}

function pollGA() {
  setInterval(async () => {
    await safe("ga:core", async () => {
      const stats = await getCoreStats();
      push("ga4", "core_stats", stats);
    });
    await safe("ga:dau", async () => {
      const dau = await getDAU();
      push("ga4", "dau", { value: dau });
    });
  }, GA_POLL_MS);
}

function pollDiscord() {
  const channels = (process.env.DISCORD_CHANNEL_IDS ?? "")
    .split(",").map(s => s.trim()).filter(Boolean);

  if (!channels.length) {
    console.log("[obs:discord] no DISCORD_CHANNEL_IDS, skipping");
    return;
  }

  setInterval(async () => {
    for (const id of channels) {
      await safe(`discord:${id}`, async () => {
        const messages = await getNewMessages(id);
        if (messages.length) push("discord", "new_messages", { channelId: id, messages });
      });
    }
  }, DISCORD_POLL_MS);
}

function streamHeroku() {
  // grab a recent snapshot first so we're not flying blind on boot
  safe("heroku:snapshot", async () => {
    const block = await getRawHerokuRecentLogs();
    push("heroku", "log_snapshot", block.data);
  });

  // live tail. fire and forget for now — if it dies we just stop getting logs
  safe("heroku:watch", async () => {
    await watchHerokuLogs(line => push("heroku", "log_line", { line }));
  });
}

export function startObservationSource() {
  if (useReal) {
    console.log("[obs] mode: real");
    void startReal();
  } else {
    console.log("[obs] mode: mock (set USE_REAL_OBSERVATIONS=true for live)");
    startMock();
  }
}
