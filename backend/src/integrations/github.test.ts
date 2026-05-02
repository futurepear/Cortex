
import "../env.js"
import { getGitHubCommits, getGitHubIssues, getGitHubProjectsV2, getGitHubRepoStats } from "./data.js";

async function main(){
    console.log(await getGitHubIssues());
    // console.log(await getGitHubCommits());
    // console.log(await getGitHubRepoStats());
    // console.log(await getGitHubProjectsV2());
}

main();