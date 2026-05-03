import type { DiscordMessage } from "../../backend/src/integrations/discordBot";

export const MOCK_DISCORD_DATA: DiscordMessage[] = [
  {
    id: "1",
    channelId: "ch-01",
    author: "User_Alpha",
    authorId: "auth-01",
    content: "Systems online. Monitoring traffic.",
    createdAt: "2026-05-02T12:00:00Z",
    url: "https://discord.com/..."
  },
  {
    id: "2",
    channelId: "ch-01",
    author: "Dev_Null",
    authorId: "auth-02",
    content: "Pushing update to the integration layer.",
    createdAt: "2026-05-02T12:05:00Z",
    url: "https://discord.com/..."
  }
];