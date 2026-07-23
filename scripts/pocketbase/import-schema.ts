#!/usr/bin/env node
import fs from "node:fs/promises";
import PocketBase from "pocketbase";

const url = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://localhost:8095";
const email = process.env.POCKETBASE_ADMIN_EMAIL;
const password = process.env.POCKETBASE_ADMIN_PASSWORD;
const schemaPath = process.env.POCKETBASE_SCHEMA_PATH || "pocketbase/pb_schema.json";

if (!email || !password) {
  console.error("Missing POCKETBASE_ADMIN_EMAIL or POCKETBASE_ADMIN_PASSWORD");
  process.exit(1);
}

const schema = JSON.parse(await fs.readFile(schemaPath, "utf8"));
if (!Array.isArray(schema)) {
  throw new Error(`${schemaPath} must contain a collection array`);
}

const pb = new PocketBase(url);
await pb.collection("_superusers").authWithPassword(email, password);
await pb.collections.import(schema, false);
console.log(`Imported ${schema.length} PocketBase collections into ${url}`);
