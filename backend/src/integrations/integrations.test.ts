/**
 * TODO(developer): Uncomment this variable and replace with your
 *   Google Analytics 4 property ID before running the sample.
 */
// propertyId = 'YOUR-GA4-PROPERTY-ID';

import dotenv from "dotenv";
import path from "path";

dotenv.config({
    path: path.resolve(process.cwd(), "../.env")
});

// Imports the Google Analytics Data API client library.
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Using a default constructor instructs the client to use the credentials
// specified in GOOGLE_APPLICATION_CREDENTIALS environment variable.
const analyticsDataClient = new BetaAnalyticsDataClient();


// Runs a simple report.
async function runReport() {
    const propertyId: number = 320859243;


    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: '2020-03-31',
                endDate: 'today',
            },
        ],
        dimensions: [
            {
                name: 'city',
            },
        ],
        metrics: [
            {
                name: 'activeUsers',
            },
        ],
    });

    if (response.rows == null || response.rows == undefined) {
        return console.log("err");
    }

    console.log('Report result:');
    response.rows.forEach((row: any) => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
    });
}

runReport();