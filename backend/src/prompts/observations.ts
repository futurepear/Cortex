import CONFIG from "../config.js";
import { getNewMessages } from "../integrations/discordBot.js";
import { getNewHerokuLogs } from "../integrations/herokuData.js";

const filter = "heroku/web.1";

// the heroku tail starts here at module load and buffers continuously,
// each call below drains and clears the buffer
const getLogs = getNewHerokuLogs(filter);

function pretty(v: unknown) {
  return JSON.stringify(v, null, 2);
}

export async function drainObservations(): Promise<string> {
  const newLogs = getLogs();
  const newDiscordMessages = await getNewMessages(CONFIG.main_chat);

  return `
You are receiving the latest Cortex observation batch.

PAPERTRAIL / SERVER NEW LOGS
filter: ${filter}
data:
${pretty(newLogs)}

DISCORD NEW MESSAGES
channelId: ${CONFIG.main_chat}
data:
${pretty(newDiscordMessages)}`;
}
