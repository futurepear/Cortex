import { google } from "googleapis";
import open from "open";
import http from "http";
import url from "url";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID!;

export const REDIRECT_URI = "http://localhost:3000/callback";

// cache so we don't auth multiple times
let cachedClient: any = null;

export async function getOAuthClient() {
  if (cachedClient) return cachedClient;

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/analytics.readonly"],
  });

  console.log("Opening browser...");
  open(authUrl);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const qs = new url.URL(req.url!, "http://localhost:3000")
          .searchParams;

        const code = qs.get("code");

        if (!code) return;

        res.end("Auth successful! You can close this tab.");
        server.close();

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        cachedClient = oauth2Client; // cache it
        resolve(oauth2Client);
      } catch (err) {
        reject(err);
      }
    });

    server.listen(3000, () => {
      console.log("Listening on http://localhost:3000");
    });
  });
}