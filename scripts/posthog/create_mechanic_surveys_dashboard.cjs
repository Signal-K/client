#!/usr/bin/env node

const https = require("https");

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID || "199773";
const host = process.env.POSTHOG_HOST || "us.posthog.com";
const dashboardName = process.env.POSTHOG_DASHBOARD_NAME || "Star Sailors Mechanics Pulse";

if (!apiKey) {
  console.error("Missing POSTHOG_PERSONAL_API_KEY");
  process.exit(1);
}

function request({ method = "GET", path, body }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: host,
        path,
        method,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch {
            parsed = { raw };
          }

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
            return;
          }

          const error = new Error(`Request failed (${res.statusCode}) ${method} ${path}`);
          error.response = parsed;
          reject(error);
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function getOrCreateDashboard() {
  const existing = await request({
    path: `/api/projects/${projectId}/dashboards/?limit=100`,
  });

  const match = (existing.results || []).find((d) => d.name === dashboardName);
  if (match) return match;

  return request({
    method: "POST",
    path: `/api/projects/${projectId}/dashboards/`,
    body: {
      name: dashboardName,
      description:
        "Mechanic micro-survey pulse board: shown, submitted, dismissed, and response quality for Star Sailors loops.",
      pinned: true,
    },
  });
}

async function createInsight({ name, event, dashboards, breakdown, interval = "day" }) {
  const payload = {
    name,
    dashboards,
    filters: {
      insight: "TRENDS",
      events: [
        {
          id: event,
          name: event,
          type: "events",
        },
      ],
      display: "ActionsLineGraph",
      interval,
      breakdown,
    },
  };

  return request({
    method: "POST",
    path: `/api/projects/${projectId}/insights/`,
    body: payload,
  });
}

async function ensureInsights(dashboardId) {
  const dashboards = [dashboardId];

  const specs = [
    {
      name: "Mechanic Survey Shown (by survey)",
      event: "mechanic_micro_survey_shown",
      breakdown: "survey_id",
    },
    {
      name: "Mechanic Survey Submitted (by survey)",
      event: "mechanic_micro_survey_submitted",
      breakdown: "survey_id",
    },
    {
      name: "Mechanic Survey Dismissed (by survey)",
      event: "mechanic_micro_survey_dismissed",
      breakdown: "survey_id",
    },
  ];

  const created = [];
  for (const spec of specs) {
    try {
      const insight = await createInsight({ ...spec, dashboards });
      created.push({ id: insight.id, name: insight.name || spec.name });
    } catch (error) {
      console.error(`Failed to create insight: ${spec.name}`);
      console.error(error.response || error.message);
    }
  }

  return created;
}

async function main() {
  const dashboard = await getOrCreateDashboard();
  const insights = await ensureInsights(dashboard.id);

  const base = `https://${host.replace(/^https?:\/\//, "")}`;
  const dashboardUrl = `${base}/project/${projectId}/dashboard/${dashboard.id}`;

  console.log(
    JSON.stringify(
      {
        dashboard: {
          id: dashboard.id,
          name: dashboard.name,
          url: dashboardUrl,
        },
        insights,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.response || error.message || error);
  process.exit(1);
});
