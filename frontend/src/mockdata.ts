import type { DiscordMessage } from "../../../../backend/src/integrations/discordBot";

export const MOCK_DISCORD_MESSAGES: DiscordMessage[] = [
  {
    id: "1001",
    channelId: "5001",
    author: "System_Admin",
    authorId: "user_01",
    content: "The latest deployment is live. Check the logs for the new integration endpoints.",
    createdAt: "2026-05-02T12:00:00Z",
    url: "https://discord.com/channels/guild/5001/1001"
  },
  {
    id: "1002",
    channelId: "5001",
    author: "Cloud_Watcher",
    authorId: "user_02",
    content: "Is anyone seeing latency spikes in the US-East region? Investigating now.",
    createdAt: "2026-05-02T12:15:00Z",
    url: "https://discord.com/channels/guild/5001/1002"
  },
  {
    id: "1003",
    channelId: "5001",
    author: "Code_Wizard",
    authorId: "user_03",
    content: "Just updated the tailwind config. Make sure to pull the latest changes before styling.",
    createdAt: "2026-05-02T12:30:00Z",
    url: "https://discord.com/channels/guild/5001/1003"
  }
];