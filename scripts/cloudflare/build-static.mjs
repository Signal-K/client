#!/usr/bin/env node
// Builds the Cloudflare static shell (SSC-31): `next build` with
// NEXT_STATIC_EXPORT=1 writes every page to out/ for Workers Static Assets.
//
// A static export cannot contain route handlers or middleware, so they are
// moved into .cf-export-stash/ for the build and always moved back, including
// after a failed or interrupted build. A stash left by a killed run is
// restored first.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..", "..");
const stash = join(root, ".cf-export-stash");
const moves = [
  ["src/app/api", "api"],
  ["src/middleware.ts", "middleware.ts"],
];

function restore() {
  if (!existsSync(stash)) return;
  for (const [source, name] of moves) {
    const parked = join(stash, name);
    if (!existsSync(parked)) continue;
    if (existsSync(join(root, source))) {
      throw new Error(`Both ${source} and .cf-export-stash/${name} exist; resolve by hand.`);
    }
    renameSync(parked, join(root, source));
  }
  if (readdirSync(stash).length === 0) rmSync(stash, { recursive: true });
}

function run(command, args, env = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", env: { ...process.env, ...env } });
  return result.status ?? 1;
}

restore();

let status = run("node", ["scripts/cloudflare/generate-routes.mjs", "--check"]);
if (status !== 0) process.exit(status);
// Type-check with the route handlers in place (the export build skips it).
status = run("npx", ["tsc", "--noEmit", "-p", "."]);
if (status !== 0) process.exit(status);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    restore();
    process.exit(130);
  });
}

try {
  mkdirSync(stash, { recursive: true });
  for (const [source, name] of moves) {
    if (existsSync(join(root, source))) renameSync(join(root, source), join(stash, name));
  }
  rmSync(join(root, ".next"), { recursive: true, force: true });
  rmSync(join(root, "out"), { recursive: true, force: true });
  status = run("npx", ["next", "build"], { NEXT_STATIC_EXPORT: "1" });
} finally {
  restore();
}

process.exit(status);
