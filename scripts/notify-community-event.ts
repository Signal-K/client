#!/usr/bin/env tsx

import PocketBase from "pocketbase";
import webpush from "web-push";
import fs from "fs";

type PushRow = {
  profileId: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  createdAt: string;
};

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.PB_URL;
const pbAdminEmail = process.env.POCKETBASE_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL;
const pbAdminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

const title = process.env.COMMUNITY_EVENT_TITLE || "Community event";
const message = process.env.COMMUNITY_EVENT_MESSAGE || "A new community event is live.";
const url = process.env.COMMUNITY_EVENT_URL || "/game";
const dryRun = String(process.env.DRY_RUN || "true").toLowerCase() === "true";
const reportPath = process.env.REPORT_PATH || "community-event-report.json";

if (!pbUrl || !pbAdminEmail || !pbAdminPassword || !vapidPublicKey || !vapidPrivateKey) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

const pb = new PocketBase(pbUrl);
const adminEmail = pbAdminEmail;
const adminPassword = pbAdminPassword;
webpush.setVapidDetails("mailto:ops@starsailors.space", vapidPublicKey, vapidPrivateKey);

async function main() {
  const start = new Date().toISOString();
  await pb.collection("_superusers").authWithPassword(adminEmail, adminPassword);

  const rows = await pb.collection("push_subscriptions").getFullList<PushRow>({
    sort: "-createdAt",
    fields: "profileId,endpoint,auth,p256dh,createdAt",
  });

  const deduped = new Map<string, PushRow>();
  for (const row of rows) {
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
      raw_subscriptions: rows.length,
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
          profile_id: sub.profileId,
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
