#!/usr/bin/env node
/**
 * Hide (do not delete) legacy built structures so every account sees the new
 * garden roster. Import `pb_schema.json` first (adds `sscHidden`), then mark
 * structure inventory + automaton linked_anomalies hidden and reset
 * `ss_hub_state` onboarding/garden JSON.
 *
 * Default is dry-run. Apply with:
 *   DRY_RUN=false yarn pocketbase:archive-legacy-structures
 *
 * Mineral inventory item 3103 is left visible (research cargo, not a plot).
 */
import fs from "node:fs/promises";
import PocketBase from "pocketbase";

import { defaultOnboarding } from "@/src/features/onboarding/hubState";
import {
  ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS,
  AUTOMATON_STRUCTURE_NAMES,
} from "@/src/features/garden/gardenLogic";

const url = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8095";
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;
const schemaPath = process.env.POCKETBASE_SCHEMA_PATH || "pocketbase/pb_schema.json";
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";

if (!email || !password) {
  console.error("Missing POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD");
  process.exit(1);
}

const pb = new PocketBase(url);

function itemFilter(): string {
  return ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS.map((id) => `item = ${id}`).join(" || ");
}

function automatonFilter(): string {
  return AUTOMATON_STRUCTURE_NAMES.map((name) => `automaton = "${name}"`).join(" || ");
}

async function hasSscHidden(collection: string): Promise<boolean> {
  const meta = await pb.collections.getOne(collection);
  const fields = (meta.fields ?? []) as Array<{ name?: string }>;
  return fields.some((field) => field.name === "sscHidden");
}

async function hideCollection(collection: string, filter: string): Promise<number> {
  // `sscHidden` only exists once pb_schema.json has been imported, and a dry-run
  // deliberately skips that import. Filtering on it unconditionally makes the
  // dry-run fail on exactly the un-migrated instances it is meant to inspect.
  const scoped = (await hasSscHidden(collection))
    ? `(${filter}) && sscHidden = false`
    : `(${filter})`;
  const rows = await pb.collection(collection).getFullList({
    filter: scoped,
    fields: "id",
  });
  if (!dryRun) {
    for (const row of rows) {
      await pb.collection(collection).update(row.id, { sscHidden: true });
    }
  }
  return rows.length;
}

async function resetHubState(): Promise<number> {
  const rows = await pb.collection("ss_hub_state").getFullList({ fields: "id,userId" });
  const onboarding = defaultOnboarding();
  if (!dryRun) {
    for (const row of rows) {
      await pb.collection("ss_hub_state").update(row.id, {
        onboarding,
        garden: null,
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return rows.length;
}

async function main() {
  await pb.collection("_superusers").authWithPassword(email!, password!);

  const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
  if (!Array.isArray(schema)) {
    throw new Error(`${schemaPath} must contain a collection array`);
  }
  if (!dryRun) {
    await pb.collections.import(schema, false);
    console.log(`Imported ${schema.length} collections into ${url}`);
  } else {
    console.log(`Dry-run: would import ${schema.length} collections into ${url}`);
  }

  const inventoryHidden = await hideCollection("inventory", itemFilter());
  const linkedHidden = await hideCollection("linked_anomalies", automatonFilter());
  const hubReset = await resetHubState();

  console.log(
    JSON.stringify(
      {
        dryRun,
        url,
        inventoryHidden,
        linkedHidden,
        hubReset,
        inventoryItems: ARCHIVE_STRUCTURE_INVENTORY_ITEM_IDS,
        automatons: AUTOMATON_STRUCTURE_NAMES,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
