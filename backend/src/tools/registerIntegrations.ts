import { ToolRegistry } from "./registry.js";
import {
  getNewMessages,
  getForumPosts,
  sendAnnouncementMessage,
} from "../integrations/discordBot.js";
import {
  getGitHubIssues,
  getGitHubCommits,
  getGitHubRepoStats,
} from "../integrations/githubData.js";
import { getRawHerokuRecentLogs, getFilteredHerokuRecentLogs } from "../integrations/herokuData.js";
import { getCoreStats, getUsersPerDayGraph } from "../integrations/ga4.js";

export function registerIntegrations(registry: ToolRegistry) {
  // Discord read helpers
  registry.register({
    name: "discord_getNewMessages",
    description: "Fetch recent messages from a Discord channel",
    parameters: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        limit: { type: "number" },
      },
      required: ["channelId"],
    },
    execute: async (args: { channelId: string; limit?: number }) => {
      return await getNewMessages(args.channelId, args.limit ?? 50);
    },
  });

  registry.register({
    name: "discord_getForumPosts",
    description: "Fetch forum posts from a Discord forum channel",
    parameters: {
      type: "object",
      properties: {
        forumChannelId: { type: "string" },
        messagesPerPost: { type: "number" },
      },
      required: ["forumChannelId"],
    },
    execute: async (args: { forumChannelId: string; messagesPerPost?: number }) => {
      return await getForumPosts(args.forumChannelId, args.messagesPerPost ?? 20);
    },
  });

  // GitHub
  registry.register({
    name: "github_getRecentIssues",
    description: "Get recent GitHub issues as AI context",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    execute: async () => {
      return await getGitHubIssues();
    },
  });

  registry.register({
    name: "github_getRecentCommits",
    description: "Get recent GitHub commits as AI context",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    execute: async () => {
      return await getGitHubCommits();
    },
  });

  registry.register({
    name: "github_getRepoStats",
    description: "Get GitHub repository stats",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    execute: async () => {
      return await getGitHubRepoStats();
    },
  });

  // Heroku logs
  registry.register({
    name: "heroku_getRecentLogs",
    description: "Fetch recent Heroku logs",
    parameters: {
      type: "object",
      properties: { lines: { type: "number" }, filter: { type: "string" } },
    },
    execute: async (args: { lines?: number; filter?: string }) => {
      return await getFilteredHerokuRecentLogs(args.lines ?? 150, args.filter ?? "heroku/web.1");
    },
  });

  // GA4
  registry.register({
    name: "ga4_getCoreStats",
    description: "Get GA4 core stats (activeUsers, sessions, pageViews, etc.)",
    parameters: { type: "object", properties: {}, additionalProperties: false },
    execute: async () => {
      return await getCoreStats();
    },
  });

  registry.register({
    name: "ga4_getUsersPerDay",
    description: "Get users per day graph (date range) from GA4",
    parameters: { type: "object", properties: { dateRange: { type: "object" } } },
    execute: async (args: { dateRange?: any }) => {
      return await getUsersPerDayGraph(args.dateRange ?? undefined);
    },
  });

  // Example destructive tool (gated): send announcement
  registry.register({
    name: "discord_sendAnnouncement",
    description: "Post an announcement message to announcements channel (DESCTRUCTIVE - require approval)",
    parameters: { type: "object", properties: { content: { type: "string" } }, required: ["content"] },
    execute: async (args: { content: string }) => {
      return await sendAnnouncementMessage(args.content);
    },
  });

  return registry;
}

export default registerIntegrations;
