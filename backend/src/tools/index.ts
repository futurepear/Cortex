import { ToolRegistry } from "./registry.js";
import { getNewMessages, sendAnnouncementMessage } from "../integrations/discordBot.js";
import { getGitHubIssues, getGitHubCommits, getGitHubRepoStats } from "../integrations/githubData.js";
import { getFilteredHerokuRecentLogs } from "../integrations/herokuData.js";
import { getCoreStats } from "../integrations/ga4.js";
import { writeReport } from "../reports/index.js";
import { dispatchAgent } from "../agent.js";

// one shared registry for the whole app
export const tools = new ToolRegistry();

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
  description: "send a coding task to a claude code agent. it will branch off production, edit code, push, open a PR, and merge it. destructive — only use when drift looks like a real code bug",
  parameters: {
    type: "object",
    properties: {
      task: { type: "string", description: "describe the bug and the fix, e.g. 'fix the null deref in src/foo.ts that's spamming heroku 5xx errors'" },
    },
    required: ["task"],
  },
  execute: async ({ task }) => {
    const wrapped = `${task}

Workflow (do this exactly, do NOT merge):
1. cd into the repo, run "git fetch origin && git checkout production && git pull origin production"
2. create a branch: "git checkout -b fix/<short-slug>"
3. make the code change
4. commit and push: "git add . && git commit -m '<short message>' && git push -u origin <branch>"
5. open a PR: "gh pr create --base production --fill"
Report back the branch name and PR url. Do not merge.`;
    const result = await dispatchAgent({ task: wrapped, workdir: process.env.CODEBASE_PATH! });
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
