import "dotenv/config";
import { Octokit } from "@octokit/rest";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

type AIContextBlock = {
  source: string;
  title: string;
  data: unknown;
};

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN!,
});

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;

// ----------------------
// GitHub Issues
// ----------------------

export async function getGitHubIssues(recentCount: number = 30): Promise<AIContextBlock> {
  const { data } = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: recentCount,
    sort: "updated",
    direction: "desc",
  });

  return {
    source: "github",
    title: "Recent GitHub issues",
    data: data.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels: issue.labels.map((l: any) => l.name),
      author: issue.user?.login,
      comments: issue.comments,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
      body: issue.body?.slice(0, 3000),
    })),
  };
}

export async function getAllGitHubIssues(): Promise<AIContextBlock> {
  const data = await octokit.paginate(
    octokit.issues.listForRepo,
    {
      owner,
      repo,
      state: "all",
      per_page: 100, // max allowed
      sort: "updated",
      direction: "desc",
    }
  );

  return {
    source: "github",
    title: "All GitHub issues",
    data: data.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels: issue.labels.map((l: any) => l.name),
      author: issue.user?.login,
      comments: issue.comments,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      url: issue.html_url,
      body: issue.body?.slice(0, 3000),
    })),
  };
}

// ----------------------
// GitHub Commits
// ----------------------

export async function getGitHubCommits(): Promise<AIContextBlock> {
  const { data } = await octokit.repos.listCommits({
    owner,
    repo,
    per_page: 30,
  });

  return {
    source: "github",
    title: "Recent GitHub commits",
    data: data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author?.name,
      date: commit.commit.author?.date,
      url: commit.html_url,
    })),
  };
}

// ----------------------
// GitHub Repo Stats
// ----------------------

export async function getGitHubRepoStats(): Promise<AIContextBlock> {
  const [repoInfo, contributors, languages, participation] = await Promise.all([
    octokit.repos.get({ owner, repo }),
    octokit.repos.listContributors({ owner, repo, per_page: 20 }),
    octokit.repos.listLanguages({ owner, repo }),
    octokit.repos.getParticipationStats({ owner, repo }),
  ]);

  return {
    source: "github",
    title: "GitHub repository stats",
    data: {
      name: repoInfo.data.full_name,
      description: repoInfo.data.description,
      stars: repoInfo.data.stargazers_count,
      forks: repoInfo.data.forks_count,
      openIssues: repoInfo.data.open_issues_count,
      watchers: repoInfo.data.watchers_count,
      defaultBranch: repoInfo.data.default_branch,
      pushedAt: repoInfo.data.pushed_at,
      contributors: contributors.data.map(c => ({
        login: c.login,
        contributions: c.contributions,
        url: c.html_url,
      })),
      languages: languages.data,
      weeklyCommits: participation.data,
    },
  };
}

// ----------------------
// GitHub Project Info
// ----------------------
// Modern GitHub Projects v2 are GraphQL-based.

export async function getGitHubProjectsV2(): Promise<AIContextBlock> {
  const query = `
    query($owner: String!) {
      organization(login: $owner) {
        projectsV2(first: 10) {
          nodes {
            id
            title
            shortDescription
            public
            closed
            updatedAt
            url
          }
        }
      }
      user(login: $owner) {
        projectsV2(first: 10) {
          nodes {
            id
            title
            shortDescription
            public
            closed
            updatedAt
            url
          }
        }
      }
    }
  `;

  const result: any = await octokit.graphql(query, { owner });

  return {
    source: "github",
    title: "GitHub Projects v2",
    data: result.organization?.projectsV2?.nodes ?? result.user?.projectsV2?.nodes ?? [],
  };
}

// ----------------------
// Heroku logs / Papertrail path
// ----------------------
// If Papertrail is attached through Heroku, logs are drained there.
// This fetches recent Heroku logs using Heroku's log session API.
// Papertrail itself is mainly a log drain/search UI/add-on.

export async function getHerokuRecentLogs(): Promise<AIContextBlock> {
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

// ----------------------
// Google Analytics 4
// ----------------------

export async function getGoogleAnalytics(): Promise<AIContextBlock> {
  const analytics = new BetaAnalyticsDataClient();

  const [response] = await analytics.runReport({
    property: `properties/${process.env.GA_PROPERTY_ID}`,
    dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    dimensions: [{ name: "date" }, { name: "country" }],
    metrics: [
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "eventCount" },
    ],
    limit: 100,
  });

  return {
    source: "google-analytics",
    title: "Google Analytics last 7 days",
    data: response.rows?.map(row => ({
      date: row.dimensionValues?.[0]?.value,
      country: row.dimensionValues?.[1]?.value,
      activeUsers: row.metricValues?.[0]?.value,
      pageViews: row.metricValues?.[1]?.value,
      eventCount: row.metricValues?.[2]?.value,
    })) ?? [],
  };
}

// ----------------------
// One function to feed AI
// ----------------------

export async function buildAIContext() {
  const blocks = await Promise.allSettled([
    getGitHubIssues(),
    getGitHubCommits(),
    getGitHubRepoStats(),
    getGitHubProjectsV2(),
    getHerokuRecentLogs(),
    getGoogleAnalytics(),
  ]);

  return blocks.map((r, i) => {
    if (r.status === "fulfilled") return r.value;

    return {
      source: "error",
      title: `Connector ${i} failed`,
      data: String(r.reason),
    };
  });
}

// // Example usage
// if (import.meta.url === `file://${process.argv[1]}`) {
//   const context = await buildAIContext();

//   console.log(
//     JSON.stringify(
//       {
//         generatedAt: new Date().toISOString(),
//         context,
//       },
//       null,
//       2,
//     ),
//   );
// }