import "dotenv/config";
import { Octokit } from "@octokit/rest";
import { AIContextBlock } from "./dataTypes.js";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN!,
});

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;

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

export async function listBranches(): Promise<AIContextBlock> {
  const { data } = await octokit.repos.listBranches({ owner, repo, per_page: 50 });
  return {
    source: "github",
    title: "GitHub branches",
    data: data.map(b => ({ name: b.name, sha: b.commit.sha, protected: b.protected })),
  };
}

export async function getOpenPRs(): Promise<AIContextBlock> {
  const { data } = await octokit.pulls.list({
    owner,
    repo,
    state: "open",
    per_page: 50,
    sort: "updated",
    direction: "desc",
  });

  return {
    source: "github",
    title: "Open GitHub PRs",
    data: data.map(pr => ({
      number: pr.number,
      title: pr.title,
      branch: pr.head.ref,
      base: pr.base.ref,
      author: pr.user?.login,
      body: pr.body?.slice(0, 1500),
      url: pr.html_url,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
    })),
  };
}

export async function getSortedGitHubIssues(): Promise<AIContextBlock> {
  const allIssues = await getAllGitHubIssues();
  const issues = Array.isArray(allIssues.data) ? allIssues.data : [];

  const sorted = [...issues].sort((left: any, right: any) => {
    const leftOpen = left.state === "open" ? 0 : 1;
    const rightOpen = right.state === "open" ? 0 : 1;
    if (leftOpen !== rightOpen) return leftOpen - rightOpen;
    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });

  return {
    ...allIssues,
    title: "Sorted GitHub issues",
    data: sorted,
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

// projects v2 uses graphql, the rest is rest
export async function getGitHubProjectsV2(): Promise<AIContextBlock> {
  const query = `
    query($owner: String!) {
      organization(login: $owner) {
        projectsV2(first: 10) {
          nodes { id title shortDescription public closed updatedAt url }
        }
      }
      user(login: $owner) {
        projectsV2(first: 10) {
          nodes { id title shortDescription public closed updatedAt url }
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
