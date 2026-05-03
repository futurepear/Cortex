import { setAnalytics } from "./ga4.js";
import { getOAuthClient } from "./oauth.js";

//init oauth
export async function init() {
    const auth = await getOAuthClient();

    setAnalytics(auth);
}

export * from "./dataTypes.js";
export * from "./discordBot.js";
export * from "./githubData.js";
export * from "./herokuData.js";
export * from "./ga4.js";
