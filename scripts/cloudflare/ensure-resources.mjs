#!/usr/bin/env node
// SSC-37 / SSC-39: make sure the Worker's KV namespace and queues exist, then
// write the namespace id into wrangler.jsonc in place of its placeholder, so
// `wrangler deploy` can bind them. Idempotent; runs before every deploy.
//
//   node scripts/cloudflare/ensure-resources.mjs [--env staging] [--check]
//
// Needs CLOUDFLARE_API_TOKEN (Account → Workers KV Storage: Edit, Queues:
// Edit) and CLOUDFLARE_ACCOUNT_ID. --check only reports what is missing.
import { readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const envIndex = args.indexOf("--env");
const target = envIndex === -1 ? "production" : args[envIndex + 1];
const checkOnly = args.includes("--check");

const RESOURCES = {
  production: {
    kv: { title: "starsailors-public-data", placeholder: "PUBLIC_DATA_KV_ID" },
    queues: ["starsailors-jobs", "starsailors-jobs-dlq"],
  },
  staging: {
    kv: { title: "starsailors-public-data-staging", placeholder: "PUBLIC_DATA_KV_ID_STAGING" },
    queues: ["starsailors-jobs-staging", "starsailors-jobs-staging-dlq"],
  },
};

const resources = RESOURCES[target];
if (!resources) {
  console.error(`Unknown --env ${target}; expected ${Object.keys(RESOURCES).join(" or ")}`);
  process.exit(2);
}

const { CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account } = process.env;
if (!token || !account) {
  console.error("CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID are required");
  process.exit(2);
}

async function api(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const errors = (body.errors ?? []).map((e) => `${e.code}: ${e.message}`).join("; ");
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status} ${errors}`);
  }
  return body;
}

async function listAll(path) {
  const items = [];
  for (let page = 1; page < 50; page++) {
    const body = await api(`${path}${path.includes("?") ? "&" : "?"}page=${page}&per_page=100`);
    items.push(...(body.result ?? []));
    const info = body.result_info;
    if (!info || page >= (info.total_pages ?? 1) || (body.result ?? []).length === 0) break;
  }
  return items;
}

const missing = [];

// KV namespace
const namespaces = await listAll("/storage/kv/namespaces");
let namespace = namespaces.find((n) => n.title === resources.kv.title);
if (!namespace) {
  if (checkOnly) missing.push(`KV namespace ${resources.kv.title}`);
  else {
    namespace = (await api("/storage/kv/namespaces", { method: "POST", body: JSON.stringify({ title: resources.kv.title }) })).result;
    console.log(`created KV namespace ${resources.kv.title} (${namespace.id})`);
  }
} else {
  console.log(`KV namespace ${resources.kv.title}: ${namespace.id}`);
}

// Queues
const queues = await listAll("/queues");
for (const name of resources.queues) {
  if (queues.some((q) => q.queue_name === name)) {
    console.log(`queue ${name}: exists`);
  } else if (checkOnly) {
    missing.push(`queue ${name}`);
  } else {
    await api("/queues", { method: "POST", body: JSON.stringify({ queue_name: name }) });
    console.log(`created queue ${name}`);
  }
}

if (missing.length) {
  console.error(`missing: ${missing.join(", ")}`);
  process.exit(1);
}

if (namespace && !checkOnly) {
  const file = new URL("../../wrangler.jsonc", import.meta.url);
  const config = readFileSync(file, "utf8");
  const quoted = `"${resources.kv.placeholder}"`;
  if (config.includes(quoted)) {
    writeFileSync(file, config.replace(quoted, `"${namespace.id}"`));
    console.log(`wrangler.jsonc: ${resources.kv.placeholder} → ${namespace.id}`);
  } else if (!config.includes(`"${namespace.id}"`)) {
    console.error(`wrangler.jsonc has neither ${quoted} nor the namespace id ${namespace.id}`);
    process.exit(1);
  }
}
