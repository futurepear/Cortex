import { google } from "googleapis";
import http from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

// npx tsx src/test/google_docs.ts <docId>
const docId = process.argv[2];
if (!docId) throw new Error("Usage: google_docs.ts <docId>");

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
const TOKEN_PATH = "google_token.json";

const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
oauth2.on("tokens", (t) => {
    const merged = { ...oauth2.credentials, ...t };
    writeFileSync(TOKEN_PATH, JSON.stringify(merged));
});

if (existsSync(TOKEN_PATH)) {
    oauth2.setCredentials(JSON.parse(readFileSync(TOKEN_PATH, "utf8")));
} else {
    const url = oauth2.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/documents.readonly"],
    });
    console.log("Open this URL to authorize:\n", url);

    const code = await new Promise<string>((resolve) => {
        const server = http.createServer((req, res) => {
            const c = new URL(req.url!, "http://localhost").searchParams.get("code");
            res.end("Authorized — close this tab.");
            if (c) { server.close(); resolve(c); }
        }).listen(Number(new URL(GOOGLE_REDIRECT_URI!).port));
    });

    const { tokens } = await oauth2.getToken(code);
    oauth2.setCredentials(tokens);
    writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
}

const docs = google.docs({ version: "v1", auth: oauth2 });
const { data } = await docs.documents.get({ documentId: docId });

console.log("\nTitle:", data.title);
for (const el of data.body?.content ?? []) {
    for (const e of el.paragraph?.elements ?? []) {
        if (e.textRun?.content) process.stdout.write(e.textRun.content);
    }
}
