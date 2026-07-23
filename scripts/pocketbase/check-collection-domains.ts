#!/usr/bin/env node
import fs from "node:fs/promises";

type DomainRule = {
  collections?: string[];
  prefix?: string;
  new_collection_prefix: string;
};

type DomainManifest = {
  rules: Record<string, DomainRule>;
};

const manifestPath = process.env.POCKETBASE_DOMAIN_MANIFEST || "pocketbase/collection-domains.json";
const schemaPath = process.env.POCKETBASE_SCHEMA_PATH || "pocketbase/pb_schema.json";
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as DomainManifest;
const schema = JSON.parse(await fs.readFile(schemaPath, "utf8")) as Array<{ name: string }>;

const legacy = manifest.rules.legacy_star_sailors;
const expectedLegacy = new Set(legacy.collections ?? []);
const actual = new Set(schema.map((collection) => collection.name));
const errors: string[] = [];

for (const collection of actual) {
  if (expectedLegacy.has(collection)) continue;
  if (!collection.startsWith(legacy.new_collection_prefix)) {
    errors.push(
      `Unknown unprefixed collection '${collection}'. Add it to a declared domain or use the '${legacy.new_collection_prefix}' prefix.`,
    );
  }
}

for (const collection of expectedLegacy) {
  if (!actual.has(collection)) {
    errors.push(`Legacy collection '${collection}' is missing from ${schemaPath}.`);
  }
}

if (errors.length > 0) {
  console.error("PocketBase collection-domain validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Collection-domain validation passed: ${actual.size} frozen legacy Star Sailors collections; new legacy collections must use '${legacy.new_collection_prefix}'.`,
);
