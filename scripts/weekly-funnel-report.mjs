import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { BigQuery } from "@google-cloud/bigquery";

function parseArgs(argv) {
  const defaults = {
    weeks: 8,
    out: "reports/funnel-weekly.csv",
  };

  const args = { ...defaults };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--weeks") {
      args.weeks = Number(argv[index + 1] || defaults.weeks);
      index += 1;
      continue;
    }

    if (token === "--out") {
      args.out = argv[index + 1] || defaults.out;
      index += 1;
    }
  }

  if (!Number.isFinite(args.weeks) || args.weeks < 1) {
    throw new Error("Invalid --weeks value. Use an integer >= 1.");
  }

  return args;
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function escapeCsv(value) {
  const raw = value == null ? "" : String(value);

  if (raw.includes(",") || raw.includes("\n") || raw.includes("\"")) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
}

function toCsv(rows) {
  if (rows.length === 0) {
    return "week_start,source,slug,goal,cta_events,converted_24h,conversion_24h_rate\n";
  }

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(","));
  }

  return `${lines.join("\n")}\n`;
}

function normalizeRow(row) {
  return {
    week_start: row.week_start?.value || row.week_start || "",
    source: row.source || "unknown",
    slug: row.slug || "unknown",
    goal: row.goal || "maintenance",
    cta_events: Number(row.cta_events || 0),
    converted_24h: Number(row.converted_24h || 0),
    conversion_24h_rate: Number(row.conversion_24h_rate || 0),
  };
}

async function main() {
  const { weeks, out } = parseArgs(process.argv.slice(2));
  const projectId = requireEnv("GA4_BQ_PROJECT_ID");
  const dataset = requireEnv("GA4_BQ_DATASET");
  const location = process.env.GA4_BQ_LOCATION || "US";

  const bigquery = new BigQuery({ projectId });
  const daysBack = weeks * 7;

  const query = `
WITH cta AS (
  SELECT
    user_pseudo_id,
    event_timestamp AS cta_ts,
    DATE_TRUNC(PARSE_DATE('%Y%m%d', event_date), WEEK(MONDAY)) AS week_start,
    COALESCE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'source'), 'unknown') AS source,
    COALESCE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'slug'), 'unknown') AS slug,
    COALESCE((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'goal'), 'maintenance') AS goal
  FROM \`${projectId}.${dataset}.events_*\`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL @daysBack DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'content_to_planner_cta'
),
plans AS (
  SELECT
    user_pseudo_id,
    event_timestamp AS plan_ts
  FROM \`${projectId}.${dataset}.events_*\`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL @daysBack DAY))
    AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())
    AND event_name = 'plan_generated'
)
SELECT
  week_start,
  source,
  slug,
  goal,
  COUNT(*) AS cta_events,
  COUNTIF(EXISTS (
    SELECT 1
    FROM plans p
    WHERE p.user_pseudo_id = cta.user_pseudo_id
      AND p.plan_ts BETWEEN cta.cta_ts AND cta.cta_ts + 24 * 60 * 60 * 1000000
  )) AS converted_24h,
  ROUND(SAFE_DIVIDE(
    COUNTIF(EXISTS (
      SELECT 1
      FROM plans p
      WHERE p.user_pseudo_id = cta.user_pseudo_id
        AND p.plan_ts BETWEEN cta.cta_ts AND cta.cta_ts + 24 * 60 * 60 * 1000000
    )),
    COUNT(*)
  ), 4) AS conversion_24h_rate
FROM cta
GROUP BY week_start, source, slug, goal
ORDER BY week_start DESC, cta_events DESC
`;

  const [rows] = await bigquery.query({
    query,
    location,
    params: {
      daysBack,
    },
  });

  const normalized = rows.map(normalizeRow);
  const csv = toCsv(normalized);
  const outputPath = path.resolve(process.cwd(), out);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, csv, "utf8");

  const totalCta = normalized.reduce((acc, row) => acc + row.cta_events, 0);
  const totalConverted = normalized.reduce((acc, row) => acc + row.converted_24h, 0);
  const totalRate = totalCta === 0 ? 0 : totalConverted / totalCta;

  console.log(`Weekly funnel CSV generated: ${outputPath}`);
  console.log(`Rows: ${normalized.length}`);
  console.log(`Total CTA events: ${totalCta}`);
  console.log(`Total converted (24h): ${totalConverted}`);
  console.log(`Total conversion (24h): ${(totalRate * 100).toFixed(2)}%`);
}

main().catch((error) => {
  console.error("Failed to generate weekly funnel report.");
  console.error(error.message || error);
  process.exitCode = 1;
});
