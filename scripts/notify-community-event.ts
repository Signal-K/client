#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import fs from "fs";

type PushRow = {
  profile_id: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  created_at: string;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

const title = process.env.COMMUNITY_EVENT_TITLE || "Community event";
const message = process.env.COMMUNITY_EVENT_MESSAGE || "A new community event is live.";
const url = process.env.COMMUNITY_EVENT_URL || "/game";
const dryRun = String(process.env.DRY_RUN || "true").toLowerCase() === "true";
const reportPath = process.env.REPORT_PATH || "community-event-report.json";

if (!supabaseUrl || !supabaseServiceKey || !vapidPublicKey || !vapidPrivateKey) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
webpush.setVapidDetails("mailto:ops@starsailors.space", vapidPublicKey, vapidPrivateKey);

async function main() {
  const start = new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("profile_id, endpoint, auth, p256dh, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load subscriptions: ${error.message}`);
  }

  const deduped = new Map<string, PushRow>();
  for (const row of (rows as PushRow[]) || []) {
    if (!deduped.has(row.endpoint)) deduped.set(row.endpoint, row);
  }
  const subscriptions = Array.from(deduped.values());

  const payload = JSON.stringify({
    title,
    body: message,
    url,
    icon: "/icon-192.png",
    tag: "community-event",
  });

  const report: {
    generated_at: string;
    dry_run: boolean;
    message: { title: string; body: string; url: string };
    totals: { raw_subscriptions: number; unique_endpoints: number; sent: number; failed: number };
    failures: Array<{ endpoint: string; profile_id: string; error: string }>;
  } = {
    generated_at: start,
    dry_run: dryRun,
    message: { title, body: message, url },
    totals: {
      raw_subscriptions: rows?.length || 0,
      unique_endpoints: subscriptions.length,
      sent: 0,
      failed: 0,
    },
    failures: [],
  };

  if (!dryRun) {
    for (const sub of subscriptions) {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,
          p256dh: sub.p256dh,
        },
      };
      try {
        await webpush.sendNotification(pushSub, payload);
        report.totals.sent += 1;
      } catch (sendError: any) {
        report.totals.failed += 1;
        report.failures.push({
          endpoint: sub.endpoint,
          profile_id: sub.profile_id,
          error: String(sendError?.message || sendError),
        });
      }
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
