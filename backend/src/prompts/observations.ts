import CONFIG from "../config.js";
import { getNewMessages, getForumPosts } from "../integrations/discordBot.js";
import { getNewHerokuLogs } from "../integrations/herokuData.js";

const filter = "heroku/web.1";

// the heroku tail starts here at module load and buffers continuously,
// each call below drains and clears the buffer
const getLogs = getNewHerokuLogs(filter);

function pretty(v: unknown) {
  return JSON.stringify(v, null, 2);
}

// run a single source. if it blows up, log + return empty so one bad source doesn't kill the tick
async function safe<T>(label: string, fn: () => Promise<T> | T, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[obs:${label}]`, (err as Error).message);
    return fallback;
  }
}

export async function drainObservations(): Promise<string> {
  const newLogs = getLogs();
  const newChat = await safe("main_chat", () => getNewMessages(CONFIG.main_chat), []);
  const newBugReports = await safe("bug_reports", () => getForumPosts(CONFIG.bug_reports), []);
  const newDevChat = CONFIG.dev_chat
    ? await safe("dev_chat", () => getNewMessages(CONFIG.dev_chat), [])
    : [];

  return `
You are receiving the latest Cortex observation batch.

KNOWN CHANNEL IDS:
- main_chat (PUBLIC, players + community): ${CONFIG.main_chat}
- bug_reports (PUBLIC forum): ${CONFIG.bug_reports}
- announcements (PUBLIC, devs post to players): ${CONFIG.announcements}
- dev_chat (INTERNAL team channel — use this for any developer-internal pings): ${CONFIG.dev_chat || "(not configured)"}

PAPERTRAIL / SERVER NEW LOGS
filter: ${filter}
data:
${pretty(newLogs)}

DISCORD MAIN CHAT — NEW MESSAGES (public)
channelId: ${CONFIG.main_chat}
data:
${pretty(newChat)}

DISCORD DEV CHAT — NEW MESSAGES (internal)
channelId: ${CONFIG.dev_chat || "(not configured)"}
data:
${pretty(newDevChat)}

DISCORD BUG REPORTS — FORUM THREADS (public)
forumChannelId: ${CONFIG.bug_reports}
data:
${pretty(newBugReports)}`;
}
