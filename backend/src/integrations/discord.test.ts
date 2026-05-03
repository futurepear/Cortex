
import "../env.js"
import {
  startDiscordBot,
  getNewMessages,
  getForumPosts,
  sendDiscordMessage
} from "./discordBot.js";

const CONFIG = {
    announcements: "1006995674946097196", //996553396557463573,
    bug_reports: "1019719977307217961",
    main_chat: "986281299775996000"
}

async function main() {
  await startDiscordBot(process.env.DISCORD_TOKEN);

  const newMessages = await getNewMessages(CONFIG.main_chat);
  console.log(newMessages);

  const forumPosts = await getForumPosts(CONFIG.bug_reports);
  console.log(forumPosts);

  // await sendDiscordMessage(CONFIG.announcements, "TUNG TUNG TUNG SAHUR");
}

main();