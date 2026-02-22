#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const https = require("https");

const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
const projectId = process.env.POSTHOG_PROJECT_ID || "199773";
const host = process.env.POSTHOG_HOST || "us.posthog.com";
const outDir = process.env.POSTHOG_MONITOR_OUT_DIR || ".knowns/reports/posthog";

if (!apiKey) {
  console.error("Missing POSTHOG_PERSONAL_API_KEY");
  process.exit(1);
}

function apiRequest(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path: pathname,
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body || "{}"));
          } catch (error) {
            reject(error);
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function aggregateBySurvey(events, eventKind) {
  const map = new Map();
  for (const entry of events) {
    const props = entry?.properties || {};
    const surveyId = props.$survey_id || "unknown";
    const surveyName = props.$survey_name || "unknown";
    const key = `${surveyId}::${surveyName}`;
    const current = map.get(key) || {
      survey_id: surveyId,
      survey_name: surveyName,
      shown: 0,
      sent: 0,
      completed: 0,
      latest: null,
    };

    if (eventKind === "survey shown") current.shown += 1;
    if (eventKind === "survey sent") {
      current.sent += 1;
      if (props.$survey_completed === true) current.completed += 1;
    }

    const ts = entry?.timestamp || null;
    if (ts && (!current.latest || ts > current.latest)) {
      current.latest = ts;
    }

    map.set(key, current);
  }
  return map;
}

async function main() {
  const [surveysRes, shownRes, sentRes] = await Promise.all([
    apiRequest(`/api/projects/${projectId}/surveys/?limit=100`),
    apiRequest(`/api/projects/${projectId}/events/?event=survey%20shown&limit=200`),
    apiRequest(`/api/projects/${projectId}/events/?event=survey%20sent&limit=200`),
  ]);

  const surveys = (surveysRes.results || []).map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    start_date: s.start_date,
    end_date: s.end_date,
    archived: s.archived,
  }));

  const shownAgg = aggregateBySurvey(shownRes.results || [], "survey shown");
  const sentAgg = aggregateBySurvey(sentRes.results || [], "survey sent");
  const merged = new Map();

  for (const [k, v] of shownAgg.entries()) merged.set(k, { ...v });
  for (const [k, v] of sentAgg.entries()) {
    const current = merged.get(k) || {
      survey_id: v.survey_id,
      survey_name: v.survey_name,
      shown: 0,
      sent: 0,
      completed: 0,
      latest: null,
    };
    current.sent += v.sent;
    current.completed += v.completed;
    if (!current.latest || (v.latest && v.latest > current.latest)) {
      current.latest = v.latest;
    }
    merged.set(k, current);
  }

  const activity = [...merged.values()]
    .map((row) => ({
      ...row,
      completion_rate:
        row.sent > 0 ? Number((row.completed / row.sent).toFixed(3)) : 0,
    }))
    .sort((a, b) => (a.latest || "").localeCompare(b.latest || ""))
    .reverse();

  const payload = {
    generated_at: new Date().toISOString(),
    project_id: projectId,
    host,
    surveys,
    activity,
  };

  fs.mkdirSync(outDir, { recursive: true });
  const stamp = payload.generated_at.replace(/[:.]/g, "-");
  const outPath = path.join(outDir, `survey-monitor-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
