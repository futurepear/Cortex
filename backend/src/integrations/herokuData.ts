
// ----------------------
// Heroku logs / Papertrail path
// ----------------------
// If Papertrail is attached through Heroku, logs are drained there.
// This fetches recent Heroku logs using Heroku's log session API.
// Papertrail itself is mainly a log drain/search UI/add-on.

import { AIContextBlock } from "./dataTypes.js";

export async function getRawHerokuRecentLogs(): Promise<AIContextBlock> {
  const app = process.env.HEROKU_APP_NAME!;
  const apiKey = process.env.HEROKU_API_KEY!;

  const res = await fetch(`https://api.heroku.com/apps/${app}/log-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.heroku+json; version=3",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lines: 150,
      tail: false,
      source: "app",
    }),
  });

  if (!res.ok) {
    throw new Error(`Heroku log session failed: ${res.status} ${await res.text()}`);
  }

  const session: any = await res.json();

  const logsRes = await fetch(session.logplex_url);
  const logsText = await logsRes.text();

  return {
    source: "heroku-papertrail",
    title: "Recent Heroku app logs",
    data: logsText
      .split("\n")
      .filter(Boolean)
      .slice(-150)
      .map(line => ({ line })),
  };
}



export async function getFilteredHerokuRecentLogs(lines: number, filter = "heroku/web.1"): Promise<AIContextBlock> {
  const app = process.env.HEROKU_APP_NAME!;
  const apiKey = process.env.HEROKU_API_KEY!;

  const res = await fetch(`https://api.heroku.com/apps/${app}/log-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.heroku+json; version=3",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lines: lines,
      tail: false,
      source: "app",
    }),
  });

  if (!res.ok) {
    throw new Error(`Heroku log session failed: ${res.status} ${await res.text()}`);
  }

  const session: any = await res.json();

  const logsRes = await fetch(session.logplex_url);
  const logsText = await logsRes.text();

  return {
    source: "heroku-papertrail",
    title: "Recent Heroku app logs",
    data: logsText
      .split("\n")
      .filter(Boolean)
      .slice(-lines)
      .map(line => ({ line })),
  };
}

export async function watchHerokuLogs(
  onLine: (line: string) => void,
  filter = "heroku/web.1"
) {
  const app = process.env.HEROKU_APP_NAME!;
  const apiKey = process.env.HEROKU_API_KEY!;

  // 1. Create log session with tail=true
  const res = await fetch(`https://api.heroku.com/apps/${app}/log-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/vnd.heroku+json; version=3",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tail: true,
      source: "app",
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to create log session: ${await res.text()}`);
  }

  const session: any = await res.json();

  // 2. Connect to streaming endpoint
  const streamRes = await fetch(session.logplex_url);

  if (!streamRes.body) {
    throw new Error("No stream body");
  }

  const reader = streamRes.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Split complete lines
    const lines = buffer.split("\n");
    buffer = lines.pop() || ""; // keep partial line

    for (const line of lines) {
      if (!line) continue;
      if (filter && !line.includes(filter)) continue;

      onLine(line);
    }
  }
}


//how to use ts: see the test file TYPE SHI

export function getNewHerokuLogs(filter: string){
    let queue: string[] = [];
    watchHerokuLogs((line: string) => {
        queue.push(line);
    }, filter);

    return function(){
        let copy = queue.map(a => a);
        queue.length = 0;
        return copy;
    }
}