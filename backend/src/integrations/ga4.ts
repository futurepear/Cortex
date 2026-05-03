// ga4.t
import { google, analyticsdata_v1beta } from "googleapis";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID!;

// // export const REDIRECT_URI = "http://localhost:3000/callback";

// // export const oauth2Client = new google.auth.OAuth2(
// //   CLIENT_ID,
// //   CLIENT_SECRET,
// //   REDIRECT_URI
// // );

export let analytics: analyticsdata_v1beta.Analyticsdata | null = null;

export function setAnalytics(oauth2Client: any){
    analytics = google.analyticsdata({
        version: "v1beta",
        auth: oauth2Client,
    });
}

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type GraphPoint = {
  label: string;
  value: number;
};

function gaDateToISO(date: string) {
  // GA4 date format: YYYYMMDD
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

export async function getUsersPerDayGraph(
  dateRange = ranges.last30Days()
): Promise<GraphPoint[]> {
  const data = await runReport({
    dateRange,
    dimensions: ["date"],
    metrics: ["activeUsers"],
    limit: 1000,
  });

  return (
    data.rows?.map((row: any) => ({
      label: gaDateToISO(row.dimensionValues?.[0]?.value ?? ""),
      value: Number(row.metricValues?.[0]?.value ?? 0),
    })) ?? []
  );
}

export const ranges = {
  today: (): DateRange => ({
    startDate: "today",
    endDate: "today",
  }),

  yesterday: (): DateRange => ({
    startDate: "yesterday",
    endDate: "yesterday",
  }),

  last7Days: (): DateRange => ({
    startDate: "7daysAgo",
    endDate: "today",
  }),

  last30Days: (): DateRange => ({
    startDate: "30daysAgo",
    endDate: "today",
  }),

  last90Days: (): DateRange => ({
    startDate: "90daysAgo",
    endDate: "today",
  }),

  custom: (startDate: string, endDate: string): DateRange => ({
    startDate,
    endDate,
  }),
};

async function runReport({
  metrics,
  dimensions = [],
  dateRange = ranges.last7Days(),
  limit = 100,
}: {
  metrics: string[];
  dimensions?: string[];
  dateRange?: DateRange;
  limit?: number;
}) {
  if(!analytics){
    return {metrics: []};
  }
  const response = await (analytics.properties as any).runReport({
    property: `properties/${GA_PROPERTY_ID}`,
    requestBody: {
      dateRanges: [dateRange],
      metrics: metrics.map((name) => ({ name })),
      dimensions: dimensions.map((name) => ({ name })),
      limit,
    },
  });

  return response.data;
}

function firstMetricValue(
  data: analyticsdata_v1beta.Schema$RunReportResponse,
  metricIndex = 0
): number {
  return Number(data.rows?.[0]?.metricValues?.[metricIndex]?.value ?? 0);
}

export async function getMAU() {
  const data = await runReport({
    metrics: ["activeUsers"],
    dateRange: ranges.last30Days(),
  });

  return firstMetricValue(data);
}

export async function getWAU() {
  const data = await runReport({
    metrics: ["activeUsers"],
    dateRange: ranges.last7Days(),
  });

  return firstMetricValue(data);
}

export async function getDAU() {
  const data = await runReport({
    metrics: ["activeUsers"],
    dateRange: ranges.today(),
  });

  return firstMetricValue(data);
}

export async function getCoreStats(dateRange = ranges.last7Days()) {
  const data = await runReport({
    dateRange,
    metrics: [
      "activeUsers",
      "newUsers",
      "sessions",
      "screenPageViews",
      "engagedSessions",
      "averageSessionDuration",
      "eventCount",
    ],
  });

  const row = data.rows?.[0];

  return {
    activeUsers: Number(row?.metricValues?.[0]?.value ?? 0),
    newUsers: Number(row?.metricValues?.[1]?.value ?? 0),
    sessions: Number(row?.metricValues?.[2]?.value ?? 0),
    pageViews: Number(row?.metricValues?.[3]?.value ?? 0),
    engagedSessions: Number(row?.metricValues?.[4]?.value ?? 0),
    averageSessionDuration: Number(row?.metricValues?.[5]?.value ?? 0),
    eventCount: Number(row?.metricValues?.[6]?.value ?? 0),
  };
}

export async function getUsersByDay(dateRange = ranges.last30Days()) {
  const data = await runReport({
    dateRange,
    dimensions: ["date"],
    metrics: ["activeUsers"],
    limit: 1000,
  });

  return (
    data.rows?.map((row: any) => ({
      date: row.dimensionValues?.[0]?.value,
      activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
    })) ?? []
  );
}

export async function getTopPages(dateRange = ranges.last7Days(), limit = 10) {
  const data = await runReport({
    dateRange,
    dimensions: ["pagePath"],
    metrics: ["screenPageViews", "activeUsers"],
    limit,
  });

  return (
    data.rows?.map((row: any) => ({
      page: row.dimensionValues?.[0]?.value,
      views: Number(row.metricValues?.[0]?.value ?? 0),
      activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
    })) ?? []
  );
}

export async function getTopEvents(dateRange = ranges.last7Days(), limit = 10) {
  const data = await runReport({
    dateRange,
    dimensions: ["eventName"],
    metrics: ["eventCount", "activeUsers"],
    limit,
  });

  return (
    data.rows?.map((row: any) => ({
      event: row.dimensionValues?.[0]?.value,
      count: Number(row.metricValues?.[0]?.value ?? 0),
      activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
    })) ?? []
  );
}

export async function getTrafficSources(dateRange = ranges.last30Days()) {
  const data = await runReport({
    dateRange,
    dimensions: ["sessionSource", "sessionMedium"],
    metrics: ["sessions", "activeUsers"],
    limit: 25,
  });

  return (
    data.rows?.map((row: any) => ({
      source: row.dimensionValues?.[0]?.value,
      medium: row.dimensionValues?.[1]?.value,
      sessions: Number(row.metricValues?.[0]?.value ?? 0),
      activeUsers: Number(row.metricValues?.[1]?.value ?? 0),
    })) ?? []
  );
}




function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function monthRangeMonthsAgo(monthsAgo: number): DateRange {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

function monthLabel(monthsAgo: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export async function getMAUByMonthGraph(months = 8): Promise<GraphPoint[]> {
  const points: GraphPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const data = await runReport({
      metrics: ["activeUsers"],
      dateRange: monthRangeMonthsAgo(i),
    });

    points.push({
      label: monthLabel(i),
      value: firstMetricValue(data),
    });
  }

  return points;
}