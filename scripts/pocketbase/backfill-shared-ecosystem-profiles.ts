#!/usr/bin/env node
/**
 * Backfill Star Sailors profiles into a shared, namespaced collection.
 *
 * The pre-existing ecosystem_profiles collection uses a PocketBase auth
 * relation. That relation is not a safe migration anchor for Clerk IDs, so
 * this bridge deliberately stores the shared user id as text. The source
 * profile id and source name keep the legacy data auditable and reversible.
 */
import fs from "node:fs/promises";
import PocketBase from "pocketbase";

const sourceUrl = process.env.LEGACY_POCKETBASE_URL || "http://127.0.0.1:8095";
const sharedUrl = process.env.SHARED_POCKETBASE_URL || "http://127.0.0.1:8090";
const sourceEmail = process.env.LEGACY_POCKETBASE_ADMIN_EMAIL;
const sourcePassword = process.env.LEGACY_POCKETBASE_ADMIN_PASSWORD;
const sharedEmail = process.env.SHARED_POCKETBASE_ADMIN_EMAIL;
const sharedPassword = process.env.SHARED_POCKETBASE_ADMIN_PASSWORD;
const reportPath = process.env.CLERK_MAP_REPORT || "clerk-shared-user-map.json";
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
const profileLimit = Number(process.env.PROFILE_LIMIT || 0);
const collectionName = "ss_ecosystem_profiles";

if (!sourceEmail || !sourcePassword || !sharedEmail || !sharedPassword) {
  console.error(
    "Missing LEGACY_POCKETBASE_ADMIN_EMAIL/PASSWORD or SHARED_POCKETBASE_ADMIN_EMAIL/PASSWORD",
  );
  process.exit(1);
}

const source = new PocketBase(sourceUrl);
const shared = new PocketBase(sharedUrl);

type SourceProfile = {
  id: string;
  userId?: string;
  username?: string;
  fullName?: string;
  referralCode?: string;
  website?: string;
  avatarUrl?: string;
  location?: number | null;
  activemission?: number | null;
  classificationPoints?: number | null;
  pushSubscription?: unknown;
};

type Mapping = {
  clerkUserId: string;
  sharedUserId: string | null;
  ecosystemProfileId: string | null;
  email: string | null;
  status: string;
};

async function ensureCollection() {
  try {
    return await shared.collections.getOne(collectionName);
  } catch (error) {
    const details = error as { status?: number };
    if (details.status !== 404) throw error;
  }

  if (dryRun) return null;

  return shared.collections.create({
    name: collectionName,
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "shared_user_id", type: "text", required: true, max: 64 },
      { name: "source_profile_id", type: "text", required: true, max: 64 },
      { name: "source", type: "text", required: true, max: 64 },
      { name: "username", type: "text", max: 255 },
      { name: "display_name", type: "text", max: 255 },
      { name: "referral_code", type: "text", max: 255 },
      { name: "website", type: "text", max: 2048 },
      { name: "avatar_url", type: "text", max: 2048 },
      { name: "location", type: "number" },
      { name: "activemission", type: "number" },
      { name: "classification_points", type: "number" },
      { name: "push_subscription", type: "json" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_ss_ecosystem_profiles_shared_user ON ss_ecosystem_profiles (shared_user_id)",
      "CREATE UNIQUE INDEX idx_ss_ecosystem_profiles_source ON ss_ecosystem_profiles (source, source_profile_id)",
    ],
  });
}

async function main() {
  await source.collection("_superusers").authWithPassword(sourceEmail!, sourcePassword!);
  await shared.collection("_superusers").authWithPassword(sharedEmail!, sharedPassword!);

  const collection = await ensureCollection();
  const profiles = (await source.collection("profiles").getFullList({
    fields:
      "id,userId,username,fullName,referralCode,website,avatarUrl,location,activemission,classificationPoints,pushSubscription",
  })) as SourceProfile[];
  const mappings = JSON.parse(await fs.readFile(reportPath, "utf8")) as Mapping[];
  const byClerkId = new Map(mappings.map((mapping) => [mapping.clerkUserId, mapping]));
  const selected = profileLimit > 0 ? profiles.slice(0, profileLimit) : profiles;
  let created = 0;
  let alreadyPresent = 0;
  let skipped = 0;

  for (const profile of selected) {
    const clerkUserId = String(profile.userId || "");
    const mapping = byClerkId.get(clerkUserId);
    if (!clerkUserId || !mapping?.sharedUserId) {
      skipped += 1;
      continue;
    }

    const record = {
      shared_user_id: mapping.sharedUserId,
      source_profile_id: profile.id,
      source: "legacy_star_sailors",
      username: profile.username || "",
      display_name: profile.fullName || profile.username || "Star Sailor",
      referral_code: profile.referralCode || "",
      website: profile.website || "",
      avatar_url: profile.avatarUrl || "",
      location: profile.location ?? null,
      activemission: profile.activemission ?? null,
      classification_points: profile.classificationPoints ?? null,
      push_subscription: profile.pushSubscription ?? null,
    };

    if (dryRun) {
      created += 1;
      continue;
    }

    const existing = await shared
      .collection(collectionName)
      .getFirstListItem(shared.filter("source_profile_id = {:id}", { id: profile.id }))
      .catch(() => null);
    if (existing) {
      alreadyPresent += 1;
      continue;
    }
    await shared.collection(collectionName).create(record);
    created += 1;
  }

  console.log(
    `${dryRun ? "[DRY RUN] " : ""}Shared ecosystem profile backfill: ${created} ${
      dryRun ? "would be created" : "created"
    }, ${alreadyPresent} already present, ${skipped} skipped, ${selected.length} source profiles.`,
  );
  if (!collection && dryRun) {
    console.log(`Collection ${collectionName} will be created during the real run.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
