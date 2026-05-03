
import CONFIG from "../config.js";
import "../env.js"
import {
  startDiscordBot,
  getNewMessages,
  getForumPosts,
  sendDiscordMessage
} from "./discordBot.js";



async function main() {
  await startDiscordBot(process.env.DISCORD_TOKEN);

  const newMessages = await getNewMessages(CONFIG.main_chat);
  console.log(newMessages);

  const forumPosts = await getForumPosts(CONFIG.bug_reports);
  console.log(forumPosts);

  // await sendDiscordMessage(CONFIG.announcements, "TUNG TUNG TUNG SAHUR");
}

main();