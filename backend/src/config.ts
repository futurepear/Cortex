// discord channel ids. all overridable via env vars
const CONFIG = {
    announcements: process.env.DISCORD_ANNOUNCEMENTS_CHANNEL || "1006995674946097196",
    bug_reports: process.env.DISCORD_BUG_REPORTS_CHANNEL || "1019719977307217961",
    main_chat: process.env.DISCORD_MAIN_CHAT_CHANNEL || "986281299775996000",
    dev_chat: process.env.DISCORD_DEV_CHAT_CHANNEL || "",   // team-internal channel for dev pings
};

export default CONFIG;
