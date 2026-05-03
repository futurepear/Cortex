import { google } from "googleapis";
import http from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

// shared google oauth client. first call opens a browser, after that
// it just loads the saved token. add scopes here when other google APIs
// need to be added (sheets, drive, etc)
const TOKEN_PATH = "google_token.json";
const SCOPES = ["https://www.googleapis.com/auth/documents.readonly"];

let cached: any = null;

export async function getGoogleAuth() {
  if (cached) return cached;

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  const oauth2 = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

  // keep the saved token current when the access token gets refreshed
  oauth2.on("tokens", (t) => {
    const merged = { ...oauth2.credentials, ...t };
    writeFileSync(TOKEN_PATH, JSON.stringify(merged));
  });

  if (existsSync(TOKEN_PATH)) {
    oauth2.setCredentials(JSON.parse(readFileSync(TOKEN_PATH, "utf8")));
    cached = oauth2;
    return oauth2;
  }

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  console.log("authorize google here:\n", url);

  const code = await new Promise<string>((resolve) => {
    const server = http.createServer((req, res) => {
      const c = new URL(req.url!, "http://localhost").searchParams.get("code");
      res.end("authorized, you can close this tab");
      if (c) { server.close(); resolve(c); }
    }).listen(Number(new URL(GOOGLE_REDIRECT_URI!).port));
  });

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  cached = oauth2;
  return oauth2;
}
