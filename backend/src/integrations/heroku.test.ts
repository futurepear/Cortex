
import "../env.js"
import { getFilteredHerokuRecentLogs, watchHerokuLogs } from "./herokuData.js";

async function main(){
    // console.log(await getFilteredHerokuRecentLogs(1000));

    watchHerokuLogs((line) => {
        console.log(line);
    }, "");
}

main();