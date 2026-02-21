#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pkgPath = path.join(root, "package.json");
const lockPath = path.join(root, "yarn.lock");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(pkgPath)) fail("package.json not found");
if (!fs.existsSync(lockPath)) fail("yarn.lock not found");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const lock = fs.readFileSync(lockPath, "utf8");

const deps = {
  ...(pkg.dependencies || {}),
  ...(pkg.devDependencies || {}),
};

const keyLines = lock
  .split("\n")
  .filter((line) => line && !line.startsWith(" ") && line.includes(":"))
  .map((line) => line.slice(0, line.indexOf(":")));

function lockHasPattern(name, range) {
  const target = `${name}@${range}`;
  return keyLines.some((key) => {
    const patterns = key
      .split(",")
      .map((value) => value.trim())
      .map((value) => value.replace(/^"/, "").replace(/"$/, ""));
    return patterns.includes(target);
  });
}

const missing = Object.entries(deps)
  .filter(([name, range]) => !lockHasPattern(name, range))
  .map(([name, range]) => `${name}@${range}`);

if (missing.length > 0) {
  fail(
    [
      "Lockfile is out of sync with package.json.",
      "Missing top-level patterns in yarn.lock:",
      ...missing.map((item) => `- ${item}`),
      "Run `yarn install` and commit the updated yarn.lock.",
    ].join("\n")
  );
}

console.log("yarn.lock is in sync with package.json top-level dependencies.");
