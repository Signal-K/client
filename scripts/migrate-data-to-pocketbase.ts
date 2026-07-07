#!/usr/bin/env tsx
/**
 * One-time data migration: production Postgres -> local Pocketbase.
 * Run after scripts/migrate-user-ids-supabase-to-clerk.sql has landed (so
 * user/author/owner columns already hold Clerk ids, not Supabase UUIDs).
 *
 * Cross-table references are preserved as plain legacyId numbers (matching
 * each collection's own `legacyId` field), not Pocketbase relation lookups —
 * see the "Open decision: record ids" note in pocketbase/README.md.
 *
 * Usage:
 *   DATABASE_URL=postgresql://... PB_URL=http://localhost:8095 \
 *     PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... \
 *     npx tsx scripts/migrate-data-to-pocketbase.ts
 */
import { Client } from "pg";
import PocketBase from "pocketbase";

const databaseUrl = process.env.DATABASE_URL;
const pbUrl = process.env.PB_URL || "http://localhost:8095";
const pbAdminEmail = process.env.PB_ADMIN_EMAIL;
const pbAdminPassword = process.env.PB_ADMIN_PASSWORD;

if (!databaseUrl || !pbAdminEmail || !pbAdminPassword) {
  console.error("Missing required env vars: DATABASE_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD");
  process.exit(1);
}

const pg = new Client({ connectionString: databaseUrl });
const pb = new PocketBase(pbUrl);

// table -> collection, plus a per-row transform from pg row shape to PB field shape.
// BigInt ids become `legacyId`; timestamps pass through as ISO strings (pg
// driver already returns Date objects for timestamptz columns).
const jobs: Array<{
  table: string;
  collection: string;
  transform: (row: Record<string, any>) => Record<string, any>;
}> = [
  {
    table: "anomalies",
    collection: "anomalies",
    transform: (r) => ({
      legacyId: Number(r.id),
      content: r.content,
      ticId: r.ticId,
      anomalytype: r.anomalytype,
      type: r.type,
      radius: r.radius,
      mass: r.mass,
      density: r.density,
      gravity: r.gravity,
      temperatureEq: r.temperatureEq,
      temperature: r.temperature,
      smaxis: r.smaxis,
      orbitalPeriod: r.orbital_period,
      classificationStatus: r.classification_status,
      avatarUrl: r.avatar_url,
      createdAt: r.created_at,
      deepnote: r.deepnote,
      lightkurve: r.lightkurve,
      configuration: r.configuration,
      parentAnomaly: r.parentAnomaly ? Number(r.parentAnomaly) : null,
      anomalySet: r.anomalySet,
      anomalyConfiguration: r.anomalyConfiguration,
    }),
  },
  {
    table: "classifications",
    collection: "classifications",
    transform: (r) => ({
      legacyId: Number(r.id),
      createdAt: r.created_at,
      content: r.content,
      author: r.author,
      anomaly: r.anomaly ? Number(r.anomaly) : null,
      media: r.media,
      classificationtype: r.classificationtype,
      classificationConfiguration: r.classificationConfiguration,
    }),
  },
  {
    table: "comments",
    collection: "comments",
    transform: (r) => ({
      legacyId: Number(r.id),
      createdAt: r.created_at,
      content: r.content,
      author: r.author,
      classificationId: r.classification_id ? Number(r.classification_id) : null,
      parentCommentId: r.parent_comment_id ? Number(r.parent_comment_id) : null,
      configuration: r.configuration,
      uploads: r.uploads ? Number(r.uploads) : null,
      surveyor: r.surveyor,
      confirmed: r.confirmed,
      value: r.value,
      category: r.category,
    }),
  },
  {
    table: "uploads",
    collection: "uploads",
    transform: (r) => ({
      legacyId: Number(r.id),
      author: r.author,
      location: Number(r.location),
      configuration: r.configuration,
      source: r.source,
      fileUrl: r.file_url,
      createdAt: r.created_at,
      content: r.content,
      name: r.name,
      originatingLocation: r.originating_location,
    }),
  },
  {
    table: "votes",
    collection: "votes",
    transform: (r) => ({
      legacyId: Number(r.id),
      userId: r.user_id,
      classificationId: r.classification_id ? Number(r.classification_id) : null,
      anomalyId: r.anomaly_id ? Number(r.anomaly_id) : null,
      createdAt: r.created_at,
      upload: r.upload ? Number(r.upload) : null,
      voteType: r.vote_type,
    }),
  },
  {
    table: "profiles",
    collection: "profiles",
    transform: (r) => ({
      userId: r.id,
      updatedAt: r.updated_at,
      username: r.username,
      fullName: r.full_name,
      avatarUrl: r.avatar_url,
      website: r.website,
      location: r.location ? Number(r.location) : null,
      activemission: r.activemission ? Number(r.activemission) : null,
      classificationPoints: r.classificationPoints ? Number(r.classificationPoints) : null,
      pushSubscription: r.push_subscription,
      referralCode: r.referral_code,
    }),
  },
  {
    table: "referrals",
    collection: "referrals",
    transform: (r) => ({
      referreeId: r.referree_id,
      referralCode: r.referral_code,
      referredAt: r.referred_at,
    }),
  },
  {
    table: "researched",
    collection: "researched",
    transform: (r) => ({
      legacyId: Number(r.id),
      techType: r.tech_type,
      techId: r.tech_id ? Number(r.tech_id) : null,
      createdAt: r.created_at,
      userId: r.user_id,
    }),
  },
  {
    table: "linked_anomalies",
    collection: "linked_anomalies",
    transform: (r) => ({
      legacyId: Number(r.id),
      author: r.author,
      anomalyId: Number(r.anomaly_id),
      classificationId: r.classification_id ? Number(r.classification_id) : null,
      date: r.date,
      automaton: r.automaton,
      unlocked: r.unlocked,
      unlockTime: r.unlock_time,
    }),
  },
  {
    table: "inventory",
    collection: "inventory",
    transform: (r) => ({
      legacyId: Number(r.id),
      item: r.item ? Number(r.item) : null,
      owner: r.owner,
      quantity: r.quantity,
      notes: r.notes,
      timeOfDeploy: r.time_of_deploy,
      anomaly: r.anomaly ? Number(r.anomaly) : null,
      parentItem: r.parentItem ? Number(r.parentItem) : null,
      configuration: r.configuration,
      terrarium: r.terrarium ? Number(r.terrarium) : null,
    }),
  },
  {
    table: "missions",
    collection: "missions",
    transform: (r) => ({
      legacyId: Number(r.id),
      userId: r.user,
      timeOfCompletion: r.time_of_completion,
      mission: r.mission ? Number(r.mission) : null,
      configuration: r.configuration,
      rewardedItems: (r.rewarded_items ?? []).map((v: any) => Number(v)),
    }),
  },
  {
    table: "routes",
    collection: "routes",
    transform: (r) => ({
      legacyId: Number(r.id),
      author: r.author,
      routeConfiguration: r.routeConfiguration,
      timestamp: r.timestamp,
      location: Number(r.location),
    }),
  },
  {
    table: '"mineralDeposits"',
    collection: "mineral_deposits",
    transform: (r) => ({
      legacyId: Number(r.id),
      anomaly: r.anomaly ? Number(r.anomaly) : null,
      owner: r.owner,
      mineralConfiguration: r.mineral_configuration,
      location: r.location,
      discovery: r.discovery ? Number(r.discovery) : null,
      createdAt: r.created_at,
      roverName: r.rover_name,
    }),
  },
  {
    table: "user_mineral_inventory",
    collection: "user_mineral_inventory",
    transform: (r) => ({
      legacyId: Number(r.id),
      userId: r.user_id,
      mineralDepositId: Number(r.mineral_deposit_id),
      mineralType: r.mineral_type,
      quantity: Number(r.quantity),
      purity: Number(r.purity),
      extractedAt: r.extracted_at,
      createdAt: r.created_at,
    }),
  },
  {
    table: "events",
    collection: "events",
    transform: (r) => ({
      legacyId: Number(r.id),
      location: Number(r.location),
      classificationLocation: Number(r.classification_location),
      type: r.type,
      configuration: r.configuration,
      time: r.time,
      completed: r.completed,
    }),
  },
  {
    table: "defensive_probes",
    collection: "defensive_probes",
    transform: (r) => ({
      eventId: r.event_id,
      userId: r.user_id,
      count: r.count,
      launchedAt: r.launched_at,
    }),
  },
  {
    table: "solar_events",
    collection: "solar_events",
    transform: (r) => ({
      weekStart: r.week_start,
      weekEnd: r.week_end,
      wasDefended: r.was_defended,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }),
  },
  {
    table: "push_subscriptions",
    collection: "push_subscriptions",
    transform: (r) => ({
      profileId: r.profile_id,
      endpoint: r.endpoint,
      p256dh: r.p256dh,
      auth: r.auth,
      createdAt: r.created_at,
    }),
  },
  {
    table: "notification_rejections",
    collection: "notification_rejections",
    transform: (r) => ({
      profileId: r.profile_id,
      createdAt: r.created_at,
    }),
  },
  {
    table: "push_anomaly_log",
    collection: "push_anomaly_log",
    transform: (r) => ({
      anomalyId: Number(r.anomaly_id),
      sentAt: r.sent_at,
    }),
  },
  {
    table: "nps_surveys",
    collection: "nps_surveys",
    transform: (r) => ({
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      npsScore: r.nps_score,
      projectInterests: r.project_interests,
      userId: r.user_id,
      userAgent: r.user_agent,
      ipAddress: r.ip_address,
      sessionId: r.session_id,
    }),
  },
  {
    table: "zoo",
    collection: "zoo",
    transform: (r) => ({
      legacyId: Number(r.id),
      author: r.author,
      owner: r.owner,
      location: r.location ? Number(r.location) : null,
      configuration: r.configuration,
      uploaded: r.uploaded ? Number(r.uploaded) : null,
      content: r.content,
      createdAt: r.created_at,
      fileUrl: r.file_url,
    }),
  },
];

async function run() {
  await pg.connect();
  await pb.collection("_superusers").authWithPassword(pbAdminEmail!, pbAdminPassword!);

  const summary: Record<string, { rows: number; created: number; errors: number }> = {};

  for (const job of jobs) {
    const { rows } = await pg.query(`SELECT * FROM ${job.table}`);
    let created = 0;
    let errors = 0;

    for (const row of rows) {
      try {
        await pb.collection(job.collection).create(job.transform(row));
        created += 1;
      } catch (err: any) {
        errors += 1;
        console.error(`[${job.collection}] failed for row id=${row.id}:`, err?.data ?? err?.message ?? err);
      }
    }

    summary[job.collection] = { rows: rows.length, created, errors };
    console.log(`${job.collection}: ${created}/${rows.length} migrated (${errors} errors)`);
  }

  console.log("\nSummary:", JSON.stringify(summary, null, 2));

  await pg.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
