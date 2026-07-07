#!/usr/bin/env tsx
/**
 * One-time storage migration: downloads every object from every Supabase
 * Storage bucket this app uses and re-uploads it into Pocketbase's
 * `storage_objects` collection, keyed by (bucket, path) — the exact same
 * addressing the app already used against Supabase's public storage URLs.
 * See src/lib/pocketbase/storageUrl.ts for the read-side lookup helper.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     PB_URL=http://localhost:8095 PB_ADMIN_EMAIL=... PB_ADMIN_PASSWORD=... \
 *     npx tsx scripts/migrate-storage-to-pocketbase.ts
 */
import PocketBase from "pocketbase";
import { storageObjectId, storageFilename } from "../src/lib/pocketbase/storageId";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const pbUrl = process.env.PB_URL || "http://localhost:8095";
const pbAdminEmail = process.env.PB_ADMIN_EMAIL!;
const pbAdminPassword = process.env.PB_ADMIN_PASSWORD!;

const BUCKETS = ["avatars", "uploads", "media", "clouds", "telescope", "anomalies", "zoodex"];

const pb = new PocketBase(pbUrl);

async function listRecursive(bucket: string, prefix = ""): Promise<string[]> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${bucket}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ limit: 1000, prefix }),
  });
  const items = await res.json();
  if (!Array.isArray(items)) return [];

  const paths: string[] = [];
  for (const item of items) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      paths.push(...(await listRecursive(bucket, fullPath)));
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

async function run() {
  await pb.collection("_superusers").authWithPassword(pbAdminEmail, pbAdminPassword);

  let migrated = 0;
  let errors = 0;

  for (const bucket of BUCKETS) {
    const paths = await listRecursive(bucket);
    console.log(`${bucket}: ${paths.length} files to migrate`);

    for (const path of paths) {
      try {
        const downloadRes = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
          { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
        );
        if (!downloadRes.ok) {
          throw new Error(`download failed: ${downloadRes.status}`);
        }
        const blob = await downloadRes.blob();
        const file = new File([blob], storageFilename(path), {
          type: downloadRes.headers.get("content-type") ?? "application/octet-stream",
        });

        const formData = new FormData();
        formData.append("id", storageObjectId(bucket, path));
        formData.append("bucket", bucket);
        formData.append("path", path);
        formData.append("file", file);

        await pb.collection("storage_objects").create(formData);
        migrated += 1;
      } catch (err: any) {
        errors += 1;
        console.error(`[${bucket}/${path}] failed:`, err?.data ?? err?.message ?? err);
      }
    }
  }

  console.log(`\nDone: ${migrated} migrated, ${errors} errors`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
