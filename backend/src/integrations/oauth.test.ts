import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve(process.cwd(), "../.env")
});


import { google } from "googleapis";
import open from "open";
import http from "http";
import url from "url";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:3000/callback";

console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Step 1: generate login URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/analytics.readonly"],
});

console.log("Opening browser...");
open(authUrl);

// Step 2: simple local server to capture callback
const server = http.createServer(async (req, res) => {
  const qs = new url.URL(req.url!, "http://localhost:3000")
    .searchParams;

  const code = qs.get("code");

  if (code) {
    res.end("Auth successful! You can close this tab.");
    server.close();

    // Step 3: exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Step 4: call GA4 API
    const analytics = google.analyticsdata({
      version: "v1beta",
      auth: oauth2Client,
    });

    const response = await analytics.properties.runReport({
      property: "properties/"+process.env.GA_PROPERTY_ID,
      requestBody: {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }],
      },
    });

    console.log("GA DATA:", JSON.stringify(response.data, null, 2));
  }
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000");
});