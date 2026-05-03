import { ToolRegistry } from "./registry.js";
import { getNewMessages, sendAnnouncementMessage } from "../integrations/discordBot.js";
import { getGitHubIssues, getGitHubCommits, getGitHubRepoStats } from "../integrations/githubData.js";
import { getFilteredHerokuRecentLogs } from "../integrations/herokuData.js";
import { getCoreStats } from "../integrations/ga4.js";

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
