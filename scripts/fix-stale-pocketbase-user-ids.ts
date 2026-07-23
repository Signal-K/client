#!/usr/bin/env tsx
/**
 * One-time remediation: some Pocketbase collections (profiles, linked_anomalies,
 * researched) were copied from Postgres via scripts/migrate-data-to-pocketbase.ts
 * before scripts/migrate-user-ids-supabase-to-clerk.sql had fully landed on the
 * source tables, so a large fraction of `profiles.userId` / `linked_anomalies.author`
 * / `researched.userId` still hold pre-Clerk Supabase UUIDs instead of Clerk ids.
 *
 * The mapping isn't lost — scripts/migrate-users-supabase-to-clerk.ts set each
 * Clerk user's `externalId` to their old Supabase UUID specifically so this kind
 * of remap could be redone. This script re-derives (old UUID -> Clerk id) via
 * Clerk's Admin API and updates the stale field in place.
 *
 * Defaults to DRY_RUN=true: reports what it would change without writing.
 * Any record whose old UUID has no matching Clerk user (externalId lookup
 * miss), or whose target Clerk id already exists on a different record in the
 * same collection (would violate the unique index), is left untouched and
 * logged to the report for manual review — never guessed or overwritten.
 *
 * Usage:
 *   NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8095 \
 *   POCKETBASE_ADMIN_EMAIL=... POCKETBASE_ADMIN_PASSWORD=... \
 *   CLERK_SECRET_KEY=... \
 *   DRY_RUN=true npx tsx scripts/fix-stale-pocketbase-user-ids.ts
 */
import PocketBase from "pocketbase";
import { createClerkClient } from "@clerk/backend";
import fs from "fs";

const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || process.env.PB_URL;
const pbAdminEmail = process.env.POCKETBASE_ADMIN_EMAIL || process.env.PB_ADMIN_EMAIL;
const pbAdminPassword = process.env.POCKETBASE_ADMIN_PASSWORD || process.env.PB_ADMIN_PASSWORD;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
const reportPath = process.env.REPORT_PATH || "fix-stale-user-ids-report.json";
const clerkUsersExport = process.env.CLERK_USERS_EXPORT;

if (!pbUrl || !pbAdminEmail || !pbAdminPassword || !clerkSecretKey) {
  console.error("Missing required env vars: NEXT_PUBLIC_POCKETBASE_URL, POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD, CLERK_SECRET_KEY");
  process.exit(1);
}

const pb = new PocketBase(pbUrl);
const clerk = createClerkClient({ secretKey: clerkSecretKey });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Target = { collection: string; field: string };
const TARGETS: Target[] = [
  { collection: "profiles", field: "userId" },
  { collection: "linked_anomalies", field: "author" },
  { collection: "researched", field: "userId" },
];

type ReportEntry = {
  collection: string;
  field: string;
  recordId: string;
  oldValue: string;
  newValue: string | null;
  status: "would-update" | "updated" | "no-clerk-match" | "conflict-existing-record" | "error";
  detail?: string;
};

async function resolveClerkIds(uuids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(uuids)];

  if (clerkUsersExport) {
    const pages = JSON.parse(fs.readFileSync(clerkUsersExport, "utf8")) as Array<{
      data?: Array<{ id?: string; external_id?: string | null }>;
    }>;
    for (const page of pages) {
      for (const user of page.data ?? []) {
        if (user.external_id && user.id) map.set(user.external_id, user.id);
      }
    }
    return map;
  }

  const BATCH = 100; // Clerk's externalId filter accepts an array; batch defensively.
  for (let i = 0; i < unique.length; i += BATCH) {
    const batch = unique.slice(i, i + BATCH);
    const { data } = await clerk.users.getUserList({ externalId: batch, limit: batch.length });
    for (const user of data) {
      if (user.externalId) map.set(user.externalId, user.id);
    }
  }
  return map;
}

async function main() {
  await pb.collection("_superusers").authWithPassword(pbAdminEmail!, pbAdminPassword!);

  const report: ReportEntry[] = [];

  for (const target of TARGETS) {
    const records = await pb.collection(target.collection).getFullList({ fields: `id,${target.field}` });
    const staleRecords = records.filter((r) => UUID_RE.test(String(r[target.field] ?? "")));

    console.log(`\n[${target.collection}.${target.field}] ${staleRecords.length} stale / ${records.length} total`);
    if (staleRecords.length === 0) continue;

    const clerkIdByUuid = await resolveClerkIds(staleRecords.map((r) => r[target.field]));

    // Track which Clerk ids are already present on some OTHER record in this
    // collection/field, to avoid violating unique indexes (profiles.userId).
    const existingValues = new Set(records.map((r) => r[target.field]));

    for (const record of staleRecords) {
      const oldValue = record[target.field] as string;
      const newValue = clerkIdByUuid.get(oldValue) ?? null;

      if (!newValue) {
        report.push({ ...target, recordId: record.id, oldValue, newValue: null, status: "no-clerk-match" });
        continue;
      }

      if (existingValues.has(newValue)) {
        report.push({ ...target, recordId: record.id, oldValue, newValue, status: "conflict-existing-record" });
        continue;
      }

      if (dryRun) {
        report.push({ ...target, recordId: record.id, oldValue, newValue, status: "would-update" });
        continue;
      }

      try {
        await pb.collection(target.collection).update(record.id, { [target.field]: newValue });
        report.push({ ...target, recordId: record.id, oldValue, newValue, status: "updated" });
      } catch (err: any) {
        report.push({
          ...target,
          recordId: record.id,
          oldValue,
          newValue,
          status: "error",
          detail: err?.message ?? String(err),
        });
      }
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  const counts = report.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Done. Report written to ${reportPath}`);
  console.log(counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
