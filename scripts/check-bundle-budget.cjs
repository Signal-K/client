#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const appBuildManifestPath = path.join(root, ".next", "app-build-manifest.json");
const buildManifestPath = path.join(root, ".next", "build-manifest.json");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing build artifact: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toBytes(kb) {
  return kb * 1024;
}

function chunkSize(staticPath) {
  const normalized = staticPath.replace(/^\/_next\//, "");
  const fullPath = path.join(root, ".next", normalized);
  if (!fs.existsSync(fullPath)) return 0;
  return fs.statSync(fullPath).size;
}

function sumBytes(files) {
  return files.reduce((sum, file) => sum + chunkSize(file), 0);
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KiB`;
}

const budgets = {
  // Calibrated against current baseline with room for small fluctuations.
  "/game": 1300,
  "/viewports/solar/page": 1250,
  "/viewports/roover/page": 1250,
  "/viewports/satellite/page": 1260,
  "/structures/telescope/page": 1450,
};

try {
  const appManifest = readJson(appBuildManifestPath);
  const buildManifest = readJson(buildManifestPath);

  const appPages = appManifest.pages || {};
  const sharedFiles = new Set([
    ...(buildManifest.rootMainFiles || []),
    ...(buildManifest.pages?.["/_app"] || []),
  ]);

  const failures = [];
  const lines = [];

  for (const [route, budgetKb] of Object.entries(budgets)) {
    const manifestKey = route.endsWith("/page") ? route : `${route}/page`;
    const routeFiles = appPages[manifestKey] || appPages[route] || [];
    const uniqueFiles = Array.from(new Set([...sharedFiles, ...routeFiles]));
    const sizeBytes = sumBytes(uniqueFiles);
    const budgetBytes = toBytes(budgetKb);

    lines.push(`${manifestKey}: ${formatKb(sizeBytes)} / budget ${budgetKb} KiB`);

    if (sizeBytes > budgetBytes) {
      failures.push(
        `${manifestKey} exceeded budget by ${formatKb(sizeBytes - budgetBytes)} (${formatKb(sizeBytes)} > ${budgetKb} KiB)`
      );
    }
  }

  console.log("Bundle budget report:");
  for (const line of lines) console.log(`- ${line}`);

  if (failures.length > 0) {
    console.error("\nBundle budget failures:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("\nBundle budgets passed.");
} catch (error) {
  console.error(`Bundle budget check failed: ${error.message}`);
  process.exit(1);
}
