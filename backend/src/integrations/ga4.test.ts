
import "../env.js"
import { init, getDAU, getWAU, getMAU, getCoreStats, getUsersByDay, getTopPages, getTopEvents, getTrafficSources, ranges } from "./index.js"

async function main(){
    await init();


    console.log("DAU:", await getDAU());
    console.log("WAU:", await getWAU());
    console.log("MAU:", await getMAU());

    console.log("Core 7d:", await getCoreStats(ranges.last7Days()));
    console.log("Users by day:", await getUsersByDay(ranges.last30Days()));
    console.log("Top pages:", await getTopPages(ranges.last7Days()));
    console.log("Top events:", await getTopEvents(ranges.last7Days()));
    console.log("Traffic:", await getTrafficSources(ranges.last30Days()));
}
main();