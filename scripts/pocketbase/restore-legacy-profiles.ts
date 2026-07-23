#!/usr/bin/env node
/**
 * Restore only legacy Star Sailors profiles from a staged PostgreSQL backup.
 *
 * This is intentionally separate from the full gameplay import: the identity
 * bridge needs profiles first, while the July 2026 backup predates the Clerk
 * UUID rewrite. After this completes, run fix-stale-pocketbase-user-ids.ts to
 * resolve profile.userId through Clerk externalId before mapping identities.
 */
import { Client } from "pg";
import PocketBase from "pocketbase";

const databaseUrl = process.env.LEGACY_DATABASE_URL;
const pbUrl = process.env.PB_URL || "http://127.0.0.1:8095";
const pbEmail = process.env.PB_ADMIN_EMAIL;
const pbPassword = process.env.PB_ADMIN_PASSWORD;
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";

if (!databaseUrl || !pbEmail || !pbPassword) {
  console.error("Missing LEGACY_DATABASE_URL, PB_ADMIN_EMAIL, or PB_ADMIN_PASSWORD");
  process.exit(1);
}

const pg = new Client({ connectionString: databaseUrl });
const pb = new PocketBase(pbUrl);

async function main() {
  await pg.connect();
  await pb.collection("_superusers").authWithPassword(pbEmail!, pbPassword!);

  const { rows } = await pg.query<{
    id: string;
    updated_at: Date | null;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    website: string | null;
    location: string | number | null;
    activemission: string | number | null;
    classificationpoints: string | number | null;
    push_subscription: unknown;
    referral_code: string | null;
  }>(`
    SELECT id, updated_at, username, full_name, avatar_url, website, location,
           "classificationPoints" AS classificationpoints, activemission,
           push_subscription, referral_code
    FROM public.profiles
    ORDER BY id
  `);

  const existing = await pb.collection("profiles").getFullList({ fields: "id,userId" });
  const existingByUserId = new Set(existing.map((record) => String(record.userId || "")));
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    if (existingByUserId.has(row.id)) {
      skipped += 1;
      continue;
    }

    const record = {
      userId: row.id,
      updatedAt: row.updated_at,
      username: row.username,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      website: row.website,
      location: row.location == null ? null : Number(row.location),
      activemission: row.activemission == null ? null : Number(row.activemission),
      classificationPoints:
        row.classificationpoints == null ? null : Number(row.classificationpoints),
      pushSubscription: row.push_subscription,
      referralCode: row.referral_code,
    };

    if (!dryRun) {
      await pb.collection("profiles").create(record);
    }
    created += 1;
  }

  await pg.end();
  console.log(`${dryRun ? "[DRY RUN] " : ""}Legacy profile restore: ${created} ${dryRun ? "would be created" : "created"}, ${skipped} already present, ${rows.length} source rows.`);
}

main().catch(async (error) => {
  await pg.end().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
