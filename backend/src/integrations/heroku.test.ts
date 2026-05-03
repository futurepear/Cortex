
import "../env.js"
import { getFilteredHerokuRecentLogs, getNewHerokuLogs, watchHerokuLogs } from "./herokuData.js";

async function main(){
    // console.log(await getFilteredHerokuRecentLogs(1000));

    // watchHerokuLogs((line) => {
    //     console.log(line);
    // }, "");

    let getLogs = getNewHerokuLogs("");

    setInterval(() => {
        console.log(getLogs())
    }, 10000);
}

main();