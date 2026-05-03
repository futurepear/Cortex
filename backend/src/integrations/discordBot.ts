
import {
  ChannelType,
  Client,
  GatewayIntentBits,
  Partials,
  TextBasedChannel,
} from "discord.js";

export type DiscordMessage = {
  id: string;
  channelId: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  url: string;
};

export type ForumPost = {
  threadId: string;
  title: string;
  starterMessage?: DiscordMessage;
  messages: DiscordMessage[];
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const cursors = new Map<string, string>();

export async function startDiscordBot(token = process.env.DISCORD_TOKEN!) {
  if (!token) throw new Error("Missing THE TOKNE DISCORD_TOKEN");

  if (!client.isReady()) {
    await client.login(token);
    await new Promise<void>((resolve) => client.once("ready", () => resolve()));
  }

  return client;
}

function cleanMessage(m: any): DiscordMessage {
  return {
    id: m.id,
    channelId: m.channelId,
    author: m.author?.username ?? "unknown",
    authorId: m.author?.id ?? "unknown",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    url: m.url,
  };
}

export async function getNewMessages(channelId: string, limit = 50) {
  const channel = await client.channels.fetch(channelId);

  if (!channel?.isTextBased()) {
    throw new Error("Channel is not text-based");
  }

  const after = cursors.get(channelId);

  const messages = await channel.messages.fetch({
    limit,
    ...(after ? { after } : {}),
  });

  const sorted = [...messages.values()]
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
    .filter((m) => !m.author.bot);

  if (sorted.length > 0) {
    cursors.set(channelId, sorted[sorted.length - 1].id);
  }

  return sorted.map(cleanMessage);
}

export async function getForumPosts(forumChannelId: string, messagesPerPost = 20) {
  const channel = await client.channels.fetch(forumChannelId);

  if (!channel || channel.type !== ChannelType.GuildForum) {
    throw new Error("Channel is not a forum channel");
  }

  const activeThreads = await channel.threads.fetchActive();

  const posts: ForumPost[] = [];

  for (const thread of activeThreads.threads.values()) {
    const messages = await thread.messages.fetch({ limit: messagesPerPost });

    const sorted = [...messages.values()]
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .filter((m) => !m.author.bot);

    posts.push({
      threadId: thread.id,
      title: thread.name,
      starterMessage: sorted[0] ? cleanMessage(sorted[0]) : undefined,
      messages: sorted.map(cleanMessage),
    });
  }

  return posts;
}

export async function sendDiscordMessage(channelId: string, content: string) {
  const channel = await client.channels.fetch(channelId);

  if (!channel?.isTextBased()) {
    throw new Error("Channel is not text-based");
  }

  const sent = await (channel as any).send(content)!;
  return cleanMessage(sent);
}

export function listGuilds() {
  return [...client.guilds.cache.values()].map(g => ({ id: g.id, name: g.name }));
}

function channelTypeName(t: number): string {
  return ({ 0: "text", 2: "voice", 4: "category", 5: "announcement", 11: "thread", 13: "stageVoice", 15: "forum" } as any)[t] ?? `type${t}`;
}

export async function listChannels(guildId: string) {
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();
  return [...channels.values()]
    .filter(Boolean)
    .map((c: any) => ({ id: c.id, name: c.name, type: channelTypeName(c.type) }));
}

export async function sendAnnouncementMessage(content: string) {
  const announcementsChannelId = "1006995674946097196";

  return sendDiscordMessage(announcementsChannelId, content);
}
