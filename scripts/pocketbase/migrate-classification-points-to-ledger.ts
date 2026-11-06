#!/usr/bin/env node
/**
 * SSL-783: carry every player's old `profiles.classificationPoints` into the
 * shared platform_contributions ledger, once.
 *
 * Each profile with points becomes one row (game garden, kind
 * legacy-classification-points, project legacy, points = the old total, day
 * 2000-01-01). The ledger's unique key makes a repeat a no-op, so the script is
 * safe to run again. Old profiles are read, never changed or deleted.
 *
 * Dry run by default: it reads and reports, and writes nothing. A real run
 * needs migration 110 (points, project) deployed on the shared backend, a
 * /pb_data backup, and the "garden" internal-app key:
 *
 *   LEGACY_POCKETBASE_URL=... LEGACY_POCKETBASE_ADMIN_EMAIL=... LEGACY_POCKETBASE_ADMIN_PASSWORD=... \
 *   SHARED_POCKETBASE_URL=... SHARED_INTERNAL_API_KEY=... DRY_RUN=false \
 *   npm run pocketbase:migrate-points-to-ledger
 */
import PocketBase from "pocketbase";

import { buildLegacyPointsRows, chunk, type LegacyProfile } from "./classification-points-ledger.ts";

const sourceUrl = process.env.LEGACY_POCKETBASE_URL || "http://127.0.0.1:8095";
const sharedUrl = (process.env.SHARED_POCKETBASE_URL || "http://127.0.0.1:8090").replace(/\/$/, "");
const email = process.env.LEGACY_POCKETBASE_ADMIN_EMAIL;
const password = process.env.LEGACY_POCKETBASE_ADMIN_PASSWORD;
const internalKey = process.env.SHARED_INTERNAL_API_KEY;
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
const PAGE = 200;

if (!email || !password) {
  console.error("Missing LEGACY_POCKETBASE_ADMIN_EMAIL/PASSWORD");
  process.exit(1);
}
if (!dryRun && !internalKey) {
  console.error("A real run needs SHARED_INTERNAL_API_KEY (the garden internal app key)");
  process.exit(1);
}

async function readProfiles(pb: PocketBase): Promise<LegacyProfile[]> {
  const profiles: LegacyProfile[] = [];
  for (let page = 1; ; page += 1) {
    // skipTotal: the page count is not needed. Only players with points are read.
    const result = await pb.collection("profiles").getList(page, PAGE, {
      fields: "userId,classificationPoints",
      filter: "classificationPoints > 0",
      sort: "id",
      skipTotal: true,
    });
    profiles.push(...(result.items as unknown as LegacyProfile[]));
    if (result.items.length < PAGE) return profiles;
  }
}

async function main() {
  const source = new PocketBase(sourceUrl);
  await source.collection("_superusers").authWithPassword(email!, password!);

  const profiles = await readProfiles(source);
  const { rows, skipped } = buildLegacyPointsRows(profiles);
  const total = rows.reduce((sum, row) => sum + row.points, 0);
  console.log(
    `${dryRun ? "[DRY RUN] " : ""}${profiles.length} profiles with points: ${rows.length} rows, ${total} points total, ` +
      `${skipped.noUser} skipped (no usable user id or duplicate), ${skipped.noPoints} skipped (no whole points).`,
  );
  if (dryRun) {
    console.log("Nothing was written. Set DRY_RUN=false for a real run.");
    return;
  }

  let received = 0;
  let added = 0;
  for (const batch of chunk(rows)) {
    const response = await fetch(`${sharedUrl}/api/platform/contributions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Api-Key": internalKey! },
      body: JSON.stringify({ rows: batch }),
    });
    if (!response.ok) {
      throw new Error(`Ledger refused a batch: ${response.status} ${await response.text()}`);
    }
    const body = (await response.json()) as { received: number; added: number };
    received += body.received;
    added += body.added;
  }
  console.log(`Ledger: ${received} received, ${added} added, ${received - added} already there.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
