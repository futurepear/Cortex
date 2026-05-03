import CONFIG from "../config.js";
import { getNewMessages } from "../integrations/discordBot.js";
import { getNewHerokuLogs } from "../integrations/herokuData.js";

const filter = "heroku/web.1";

let getLogs = getNewHerokuLogs(filter);

function pretty(value: unknown) {
    return JSON.stringify(value, null, 2);
}

export async function drainObservations(): Promise<string> {

    let newLogs = getLogs();
    let newDiscordMessages = await getNewMessages(CONFIG.main_chat);

    //papertrail      - new messages
    //ga4             - TOOL ONLY
    //discord         - new messages
    //github issue    - TOOL
    //commit history  - TOOL ONLY 
    //repo info       - TOOL ONLY
    //docs            - RAG/TOOL ONLY - some goes in system prompt
    //action logs     - TOOL ONLY

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
