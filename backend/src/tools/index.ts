import {
    getAllGitHubIssues,
    getCoreStats,
    getDAU,
    getFilteredHerokuRecentLogs,
    getForumPosts,
    getGitHubCommits,
    getGitHubIssues,
    getGitHubProjectsV2,
    getGitHubRepoStats,
    getGoogleAnalytics,
    getMAU,
    getMAUByMonthGraph,
    getNewHerokuLogs,
    getNewMessages,
    getRawHerokuRecentLogs,
    getTopEvents,
    getTopPages,
    getTrafficSources,
    getUsersByDay,
    getUsersPerDayGraph,
    getWAU,
    init,
    sendDiscordMessage,
    sendAnnouncementMessage,
    setAnalytics,
    startDiscordBot,
    watchHerokuLogs,
} from "../integrations/index.js";
import { getOAuthClient } from "../integrations/oauth.js";
import { getTopKReportsByDate, searchReportsBM25 } from "../reports/index.js";
import { ToolRegistry } from "./registry.js";

const tools = new ToolRegistry();

const emptyObjectSchema = {
    type: "object",
    properties: {},
    additionalProperties: false,
};

const dateRangeSchema = {
    type: "object",
    properties: {
        startDate: { type: "string" },
        endDate: { type: "string" },
    },
    required: ["startDate", "endDate"],
    additionalProperties: false,
};

tools.register({
    name: "init",
    description: "Initialize the Google Analytics integration by completing OAuth and setting the analytics client.",
    parameters: emptyObjectSchema,
    execute: async () => init(),
});

tools.register({
    name: "startDiscordBot",
    description: "Start the Discord bot client.",
    parameters: {
        type: "object",
        properties: {
            token: { type: "string" },
        },
        additionalProperties: false,
    },
    execute: async ({ token }: { token?: string } = {}) =>
        token === undefined ? startDiscordBot() : startDiscordBot(token),
});

tools.register({
    name: "getNewMessages",
    description: "Fetch new non-bot messages from a Discord text channel.",
    parameters: {
        type: "object",
        properties: {
            channelId: { type: "string" },
            limit: { type: "number" },
        },
        required: ["channelId"],
        additionalProperties: false,
    },
    execute: async ({ channelId, limit }: { channelId: string; limit?: number }) =>
        limit === undefined ? getNewMessages(channelId) : getNewMessages(channelId, limit),
});

tools.register({
    name: "getForumPosts",
    description: "Fetch active posts and recent messages from a Discord forum channel.",
    parameters: {
        type: "object",
        properties: {
            forumChannelId: { type: "string" },
            messagesPerPost: { type: "number" },
        },
        required: ["forumChannelId"],
        additionalProperties: false,
    },
    execute: async ({ forumChannelId, messagesPerPost }: { forumChannelId: string; messagesPerPost?: number }) =>
        messagesPerPost === undefined
            ? getForumPosts(forumChannelId)
            : getForumPosts(forumChannelId, messagesPerPost),
});

tools.register({
    name: "sendDiscordMessage",
    description: "Send a message to a Discord text channel.",
    parameters: {
        type: "object",
        properties: {
            channelId: { type: "string" },
            content: { type: "string" },
        },
        required: ["channelId", "content"],
        additionalProperties: false,
    },
    execute: async ({ channelId, content }: { channelId: string; content: string }) =>
        sendDiscordMessage(channelId, content),
});

tools.register({
    name: "sendAnnouncementMessage",
    description: "Send a message to the configured Discord announcements channel.",
    parameters: {
        type: "object",
        properties: {
            content: { type: "string" },
        },
        required: ["content"],
        additionalProperties: false,
    },
    execute: async ({ content }: { content: string }) =>
        sendAnnouncementMessage(content),
});

tools.register({
    name: "getGitHubIssues",
    description: "Fetch recent GitHub issues for the configured repository.",
    parameters: {
        type: "object",
        properties: {
            recentCount: { type: "number" },
        },
        additionalProperties: false,
    },
    execute: async ({ recentCount }: { recentCount?: number } = {}) =>
        recentCount === undefined ? getGitHubIssues() : getGitHubIssues(recentCount),
});

tools.register({
    name: "getAllGitHubIssues",
    description: "Fetch all GitHub issues for the configured repository.",
    parameters: emptyObjectSchema,
    execute: async () => getAllGitHubIssues(),
});

tools.register({
    name: "getGitHubCommits",
    description: "Fetch recent GitHub commits for the configured repository.",
    parameters: emptyObjectSchema,
    execute: async () => getGitHubCommits(),
});

tools.register({
    name: "getGitHubRepoStats",
    description: "Fetch repository stats, contributors, languages, and participation data from GitHub.",
    parameters: emptyObjectSchema,
    execute: async () => getGitHubRepoStats(),
});

tools.register({
    name: "getGitHubProjectsV2",
    description: "Fetch GitHub Projects v2 for the configured owner.",
    parameters: emptyObjectSchema,
    execute: async () => getGitHubProjectsV2(),
});

tools.register({
    name: "getGoogleAnalytics",
    description: "Fetch the Google Analytics report from the GitHub integration helper.",
    parameters: emptyObjectSchema,
    execute: async () => getGoogleAnalytics(),
});

tools.register({
    name: "getRawHerokuRecentLogs",
    description: "Fetch recent raw Heroku app logs.",
    parameters: emptyObjectSchema,
    execute: async () => getRawHerokuRecentLogs(),
});

tools.register({
    name: "getFilteredHerokuRecentLogs",
    description: "Fetch recent Heroku app logs with a configurable line count.",
    parameters: {
        type: "object",
        properties: {
            lines: { type: "number" },
            filter: { type: "string" },
        },
        required: ["lines"],
        additionalProperties: false,
    },
    execute: async ({ lines, filter }: { lines: number; filter?: string }) =>
        filter === undefined ? getFilteredHerokuRecentLogs(lines) : getFilteredHerokuRecentLogs(lines, filter),
});

tools.register({
    name: "watchHerokuLogs",
    description: "Registered placeholder for the streaming Heroku log watcher.",
    parameters: {
        type: "object",
        properties: {
            filter: { type: "string" },
        },
        additionalProperties: false,
    },
    execute: async ({ filter }: { filter?: string } = {}) => {
        void filter;
        void watchHerokuLogs;
        throw new Error("watchHerokuLogs requires a live callback stream and cannot be executed through the JSON tool interface.");
    },
});

tools.register({
    name: "getNewHerokuLogs",
    description: "Registered placeholder for the incremental Heroku log watcher factory.",
    parameters: {
        type: "object",
        properties: {
            filter: { type: "string" },
        },
        required: ["filter"],
        additionalProperties: false,
    },
    execute: async ({ filter }: { filter: string }) => {
        void filter;
        void getNewHerokuLogs;
        throw new Error("getNewHerokuLogs returns a function and cannot be executed meaningfully through the JSON tool interface.");
    },
});

tools.register({
    name: "setAnalytics",
    description: "Create an OAuth client and set the shared Google Analytics client.",
    parameters: emptyObjectSchema,
    execute: async () => {
        const oauth2Client = await getOAuthClient();
        setAnalytics(oauth2Client);
        return { ok: true };
    },
});

tools.register({
    name: "getTopKReportsByDate",
    description: "Fetch the most recent stored reports, ordered by file timestamp descending.",
    parameters: {
        type: "object",
        properties: {
            k: { type: "number" },
        },
        required: ["k"],
        additionalProperties: false,
    },
    execute: async ({ k }: { k: number }) => getTopKReportsByDate(k),
});

tools.register({
    name: "searchReportsBM25",
    description: "Search stored reports with BM25 ranking and return the top matching results.",
    parameters: {
        type: "object",
        properties: {
            query: { type: "string" },
            k: { type: "number" },
        },
        required: ["query", "k"],
        additionalProperties: false,
    },
    execute: async ({ query, k }: { query: string; k: number }) => searchReportsBM25(query, k),
});

tools.register({
    name: "getUsersPerDayGraph",
    description: "Fetch a graph of active users per day from GA4.",
    parameters: {
        type: "object",
        properties: {
            dateRange: dateRangeSchema,
        },
        additionalProperties: false,
    },
    execute: async ({ dateRange }: { dateRange?: { startDate: string; endDate: string } } = {}) =>
        dateRange === undefined ? getUsersPerDayGraph() : getUsersPerDayGraph(dateRange),
});

tools.register({
    name: "getMAU",
    description: "Fetch monthly active users from GA4.",
    parameters: emptyObjectSchema,
    execute: async () => getMAU(),
});

tools.register({
    name: "getWAU",
    description: "Fetch weekly active users from GA4.",
    parameters: emptyObjectSchema,
    execute: async () => getWAU(),
});

tools.register({
    name: "getDAU",
    description: "Fetch daily active users from GA4.",
    parameters: emptyObjectSchema,
    execute: async () => getDAU(),
});

tools.register({
    name: "getCoreStats",
    description: "Fetch core Google Analytics stats for a date range.",
    parameters: {
        type: "object",
        properties: {
            dateRange: dateRangeSchema,
        },
        additionalProperties: false,
    },
    execute: async ({ dateRange }: { dateRange?: { startDate: string; endDate: string } } = {}) =>
        dateRange === undefined ? getCoreStats() : getCoreStats(dateRange),
});

tools.register({
    name: "getUsersByDay",
    description: "Fetch active user counts by day from GA4.",
    parameters: {
        type: "object",
        properties: {
            dateRange: dateRangeSchema,
        },
        additionalProperties: false,
    },
    execute: async ({ dateRange }: { dateRange?: { startDate: string; endDate: string } } = {}) =>
        dateRange === undefined ? getUsersByDay() : getUsersByDay(dateRange),
});

tools.register({
    name: "getTopPages",
    description: "Fetch top pages from GA4.",
    parameters: {
        type: "object",
        properties: {
            dateRange: dateRangeSchema,
            limit: { type: "number" },
        },
        additionalProperties: false,
    },
    execute: async ({ dateRange, limit }: { dateRange?: { startDate: string; endDate: string }; limit?: number } = {}) => {
        if (dateRange === undefined && limit === undefined) {
            return getTopPages();
        }

        if (limit === undefined) {
            return getTopPages(dateRange);
        }

        return getTopPages(dateRange, limit);
    },
});

tools.register({
    name: "getTopEvents",
    description: "Fetch top events from GA4.",
    parameters: {
        type: "object",
        properties: {
            dateRange: dateRangeSchema,
            limit: { type: "number" },
        },
        additionalProperties: false,
    },
    execute: async ({ dateRange, limit }: { dateRange?: { startDate: string; endDate: string }; limit?: number } = {}) => {
        if (dateRange === undefined && limit === undefined) {
            return getTopEvents();
        }

        if (limit === undefined) {
            return getTopEvents(dateRange);
        }

        return getTopEvents(dateRange, limit);
    },
});

tools.register({
    name: "getTrafficSources",
    description: "Fetch traffic sources from GA4.",
    parameters: {
        type: "object",
        properties: {
            dateRange: dateRangeSchema,
        },
        additionalProperties: false,
    },
    execute: async ({ dateRange }: { dateRange?: { startDate: string; endDate: string } } = {}) =>
        dateRange === undefined ? getTrafficSources() : getTrafficSources(dateRange),
});

tools.register({
    name: "getMAUByMonthGraph",
    description: "Fetch monthly active user graph points from GA4.",
    parameters: {
        type: "object",
        properties: {
            months: { type: "number" },
        },
        additionalProperties: false,
    },
    execute: async ({ months }: { months?: number } = {}) =>
        months === undefined ? getMAUByMonthGraph() : getMAUByMonthGraph(months),
});

export { tools };
export const toolSchemas = tools.getSchemas();
export default tools;
