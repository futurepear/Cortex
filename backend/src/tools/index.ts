import { ToolRegistry } from "./registry.js";
import { getNewMessages, sendAnnouncementMessage, sendDiscordMessage, listGuilds, listChannels, listMembers, getForumPosts } from "../integrations/discordBot.js";
import { getGitHubIssues, getGitHubCommits, getGitHubRepoStats, getOpenPRs, listBranches } from "../integrations/githubData.js";
import { getFilteredHerokuRecentLogs } from "../integrations/herokuData.js";
import { getCoreStats } from "../integrations/ga4.js";
import { writeReport } from "../reports/index.js";
import { dispatchAgent } from "../agent.js";

// one shared registry for the whole app
export const tools = new ToolRegistry();

// hard cap on coding agent dispatches per tick. reset by reconciler at the start of each tick
const MAX_DISPATCHES_PER_TICK = Number(process.env.MAX_DISPATCHES_PER_TICK) || 2;
let dispatchesThisTick = 0;
export function resetDispatchCounter() {
  dispatchesThisTick = 0;
}

tools.register({
  name: "discord_getNewMessages",
  description: "fetch recent messages from a discord channel",
  parameters: {
    type: "object",
    properties: {
      channelId: { type: "string" },
      limit: { type: "number" },
    },
    required: ["channelId"],
  },
  execute: ({ channelId, limit }) => getNewMessages(channelId, limit ?? 50),
});

tools.register({
  name: "discord_listGuilds",
  description: "list every discord server (guild) the bot is in. returns [{id, name}]",
  parameters: { type: "object", properties: {} },
  execute: () => listGuilds(),
});

tools.register({
  name: "discord_listChannels",
  description: "list every channel in a discord server. returns [{id, name, type}]. type can be 'text', 'forum', 'announcement' etc",
  parameters: {
    type: "object",
    properties: { guildId: { type: "string" } },
    required: ["guildId"],
  },
  execute: ({ guildId }) => listChannels(guildId),
});

tools.register({
  name: "discord_listMembers",
  description: "list every human (non-bot) member in a discord server. returns [{id, username, displayName, mention}]. use the 'mention' string to @ someone in a message",
  parameters: {
    type: "object",
    properties: { guildId: { type: "string" } },
    required: ["guildId"],
  },
  execute: ({ guildId }) => listMembers(guildId),
});

tools.register({
  name: "discord_sendMessage",
  description: "send a message to any discord text channel. destructive — use carefully",
  parameters: {
    type: "object",
    properties: {
      channelId: { type: "string" },
      content: { type: "string" },
    },
    required: ["channelId", "content"],
  },
  execute: ({ channelId, content }) => sendDiscordMessage(channelId, content),
});

tools.register({
  name: "discord_getForumPosts",
  description: "list active threads (posts) in a discord forum channel and their messages",
  parameters: {
    type: "object",
    properties: {
      forumChannelId: { type: "string" },
      messagesPerPost: { type: "number" },
    },
    required: ["forumChannelId"],
  },
  execute: ({ forumChannelId, messagesPerPost }) => getForumPosts(forumChannelId, messagesPerPost ?? 20),
});

tools.register({
  name: "discord_sendAnnouncement",
  description: "post an announcement to the announcements channel. destructive, only use when sure",
  parameters: {
    type: "object",
    properties: { content: { type: "string" } },
    required: ["content"],
  },
  execute: ({ content }) => sendAnnouncementMessage(content),
});

tools.register({
  name: "github_getOpenPRs",
  description: "list open pull requests on the configured repo. always check this before dispatching a coding agent — if a PR already addresses the same issue, don't dispatch again",
  parameters: { type: "object", properties: {} },
  execute: () => getOpenPRs(),
});

tools.register({
  name: "github_getRecentIssues",
  description: "list the most recent github issues on the configured repo",
  parameters: { type: "object", properties: {} },
  execute: () => getGitHubIssues(),
});

tools.register({
  name: "github_getRecentCommits",
  description: "list the most recent commits on the configured repo",
  parameters: { type: "object", properties: {} },
  execute: () => getGitHubCommits(),
});

tools.register({
  name: "github_listBranches",
  description: "list every branch on the configured repo. use to spot stale or abandoned dev branches",
  parameters: { type: "object", properties: {} },
  execute: () => listBranches(),
});

tools.register({
  name: "github_getRepoStats",
  description: "stars, forks, languages, weekly commit cadence for the configured repo",
  parameters: { type: "object", properties: {} },
  execute: () => getGitHubRepoStats(),
});

tools.register({
  name: "heroku_getRecentLogs",
  description: "snapshot of recent heroku log lines, optional filter and line count",
  parameters: {
    type: "object",
    properties: {
      lines: { type: "number" },
      filter: { type: "string" },
    },
  },
  execute: ({ lines, filter }) => getFilteredHerokuRecentLogs(lines ?? 150, filter ?? "heroku/web.1"),
});

tools.register({
  name: "ga4_getCoreStats",
  description: "GA4 core stats: activeUsers, sessions, pageViews, etc for the last week",
  parameters: { type: "object", properties: {} },
  execute: () => getCoreStats(),
});

tools.register({
  name: "dispatchCodingAgent",
  description: "hand off a bug or feature to a claude code agent. the agent has full access to the codebase and can read, investigate, and fix code on its own — you do NOT need to pinpoint the cause first, just describe the symptoms and let it investigate. it will branch off the given base, make a fix, push, and open a PR. destructive but the PR isn't merged automatically",
  parameters: {
    type: "object",
    properties: {
      task: { type: "string", description: "describe the bug and the fix, e.g. 'fix the null deref in src/foo.ts that's spamming heroku 5xx errors'" },
      baseBranch: { type: "string", description: "branch to base the PR off, e.g. 'main' or 'production'. defaults to production" },
    },
    required: ["task"],
  },
  execute: async ({ task, baseBranch }) => {
    if (dispatchesThisTick >= MAX_DISPATCHES_PER_TICK) {
      return { skipped: true, reason: `max ${MAX_DISPATCHES_PER_TICK} dispatches per tick reached. handle this one on the next tick.` };
    }
    dispatchesThisTick++;

    const base = baseBranch ?? "production";
    const wrapped = `${task}

Workflow (do this exactly, do NOT merge):
1. cd into the repo, run "git fetch origin && git checkout ${base} && git pull origin ${base}"
2. INVESTIGATE: read the relevant code, look for the cause of the bug. if you can't find any evidence the bug actually exists in the current code, abort and report "could not reproduce or locate the bug".
3. create a branch: "git checkout -b fix/<short-slug>"
4. SAFETY CHECK: run "git branch --show-current". if it equals "${base}", abort immediately — never commit on the base branch
5. make the code change
6. commit and push: "git add . && git commit -m '<short message>' && git push -u origin <branch>"
7. open a PR: "gh pr create --base ${base} --fill"
Report back the branch name and PR url. Do not merge.`;

    console.log(`\n[claude start] ${task.slice(0, 80)}...`);
    const result = await dispatchAgent({
      task: wrapped,
      workdir: process.env.CODEBASE_PATH!,
      onText: (t) => console.log(`[claude] ${t.trim()}`),
      onToolUse: (name, input) => console.log(`[claude tool] ${name} ${JSON.stringify(input).slice(0, 200)}`),
    });
    console.log(`[claude done]`);
    return { text: result.text, toolUseCount: result.toolUses.length };
  },
});

tools.register({
  name: "writeReport",
  description: "save a report (analytics summary, drift findings, action taken, etc) to disk so we can search it later",
  parameters: {
    type: "object",
    properties: {
      report: { type: "string" },
    },
    required: ["report"],
  },
  execute: ({ report }) => writeReport(report),
});
