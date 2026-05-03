import type { DiscordMessage } from "../../backend/src/integrations/discordBot";

export const MOCK_DISCORD_DATA: DiscordMessage[] = [
  {
    id: "1",
    channelId: "ch-01",
    author: "User_Alpha",
    authorId: "auth-01",
    content: "Systems online. Monitoring traffic.",
    createdAt: "2026-05-02T12:00:00Z",
    url: "https://discord.com/channels/123/456/1"
  },
  {
    id: "2",
    channelId: "ch-01",
    author: "Dev_Null",
    authorId: "auth-02",
    content: "Pushing update to the integration layer.",
    createdAt: "2026-05-02T12:05:00Z",
    url: "https://discord.com/channels/123/456/2"
  },
  {
    id: "3",
    channelId: "ch-01",
    author: "Net_Watcher",
    authorId: "auth-03",
    content: "Latency spike detected in US-East-1. Investigating.",
    createdAt: "2026-05-02T12:10:00Z",
    url: "https://discord.com/channels/123/456/3"
  },
  {
    id: "4",
    channelId: "ch-02",
    author: "Security_Bot",
    authorId: "auth-04",
    content: "Unauthorized access attempt blocked at gateway 7.",
    createdAt: "2026-05-02T12:15:00Z",
    url: "https://discord.com/channels/123/456/4"
  },
  {
    id: "5",
    channelId: "ch-01",
    author: "Sudo_Admin",
    authorId: "auth-05",
    content: "Database migration complete. 1.2M rows affected.",
    createdAt: "2026-05-02T12:20:00Z",
    url: "https://discord.com/channels/123/456/5"
  },
  {
    id: "6",
    channelId: "ch-03",
    author: "Log_Parser",
    authorId: "auth-06",
    content: "Error rate dropped to 0.02% post-deployment.",
    createdAt: "2026-05-02T12:25:00Z",
    url: "https://discord.com/channels/123/456/6"
  },
  {
    id: "7",
    channelId: "ch-01",
    author: "User_Alpha",
    authorId: "auth-01",
    content: "Traffic normal. Re-enabling automated health checks.",
    createdAt: "2026-05-02T12:30:00Z",
    url: "https://discord.com/channels/123/456/7"
  },
  {
    id: "8",
    channelId: "ch-02",
    author: "Ops_Lead",
    authorId: "auth-07",
    content: "Scaling cluster nodes to handle evening peak load.",
    createdAt: "2026-05-02T12:35:00Z",
    url: "https://discord.com/channels/123/456/8"
  },
  {
    id: "9",
    channelId: "ch-01",
    author: "Dev_Null",
    authorId: "auth-02",
    content: "API documentation updated for the new integration endpoints.",
    createdAt: "2026-05-02T12:40:00Z",
    url: "https://discord.com/channels/123/456/9"
  },
  {
    id: "10",
    channelId: "ch-03",
    author: "Root_Shell",
    authorId: "auth-08",
    content: "Heartbeat signal confirmed. All services operational.",
    createdAt: "2026-05-02T12:45:00Z",
    url: "https://discord.com/channels/123/456/10"
  }
];