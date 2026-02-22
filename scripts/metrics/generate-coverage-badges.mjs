#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const BADGES_DIR = path.join(ROOT, ".github", "badges");
const CODE_BADGE_PATH = path.join(BADGES_DIR, "code-coverage.json");
const SDD_BADGE_PATH = path.join(BADGES_DIR, "sdd-coverage.json");
const METRICS_PATH = path.join(BADGES_DIR, "metrics-summary.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, payload) {
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`);
}

function pctColor(pct) {
  if (pct >= 90) return "brightgreen";
  if (pct >= 80) return "green";
  if (pct >= 70) return "yellowgreen";
  if (pct >= 60) return "yellow";
  if (pct >= 40) return "orange";
  return "red";
}

function findCoverageSummary() {
  const candidates = [
    path.join(ROOT, "coverage", "coverage-summary.json"),
    path.join(ROOT, "coverage", "json-summary.json"),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) return file;
  }

  return null;
}

function computeCodeCoveragePercent() {
  const summaryFile = findCoverageSummary();
  if (!summaryFile) {
    throw new Error("Coverage summary file not found. Run unit tests with coverage first.");
  }

  const summary = readJson(summaryFile);
  const total = summary.total || summary;
  const linesPct = Number(total?.lines?.pct ?? total?.total?.lines?.pct ?? 0);

  return {
    percent: Number.isFinite(linesPct) ? linesPct : 0,
    source: path.relative(ROOT, summaryFile),
  };
}

function parseTaskFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return null;
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return raw.slice(4, end);
}

function extractSpecReferences(frontmatter) {
  if (!frontmatter) return [];

  const refs = new Set();

  const singleSpec = frontmatter.match(/(?:^|\n)spec:\s*"?([^"\n]+)"?/);
  if (singleSpec?.[1]) refs.add(singleSpec[1].trim());

  const blockKeys = ["specRefs", "specs", "references"];
  for (const key of blockKeys) {
    const blockRegex = new RegExp(`(?:^|\\n)${key}:\\n([\\s\\S]*?)(?=\\n[a-zA-Z0-9_]+:|$)`);
    const block = frontmatter.match(blockRegex)?.[1] || "";
    for (const item of block.matchAll(/\n\s*-\s*"?([^"\n]+)"?/g)) {
      if (item?.[1]) refs.add(item[1].trim());
    }
  }

  return Array.from(refs).filter((v) => v.length > 0);
}

function normalizeSpecRef(ref) {
  let normalized = ref.trim();
  normalized = normalized.replace(/^@doc\//, "");
  normalized = normalized.replace(/^\.knowns\/docs\//, "");
  normalized = normalized.replace(/^docs\//, "");
  normalized = normalized.replace(/\.md$/, "");
  return normalized;
}

function computeSddFallbackCoverage() {
  const tasksDir = path.join(ROOT, ".knowns", "tasks");
  if (!fs.existsSync(tasksDir)) {
    return { percent: 0, linked: 0, total: 0, source: "fallback-no-knowns" };
  }

  const taskFiles = fs
    .readdirSync(tasksDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(tasksDir, name));

  let linked = 0;
  for (const file of taskFiles) {
    const raw = fs.readFileSync(file, "utf8");
    const fm = parseTaskFrontmatter(raw);
    const refs = extractSpecReferences(fm).map(normalizeSpecRef);

    const hasResolvableRef = refs.some((ref) => {
      if (!ref.startsWith("specs/")) return false;
      return fs.existsSync(path.join(ROOT, ".knowns", "docs", `${ref}.md`));
    });

    if (hasResolvableRef) linked += 1;
  }

  const total = taskFiles.length;
  const percent = total > 0 ? (linked / total) * 100 : 0;

  return {
    percent,
    linked,
    total,
    source: "fallback-frontmatter-parser",
  };
}

function computeSddCoverage() {
  try {
    const out = execSync("knowns validate --sdd --json", {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });
    const payload = JSON.parse(out);
    const percent = Number(payload?.stats?.coverage?.percent ?? 0);
    const linked = Number(payload?.stats?.coverage?.linked ?? 0);
    const total = Number(payload?.stats?.coverage?.total ?? 0);
    return { percent, linked, total, source: "knowns-cli" };
  } catch {
    return computeSddFallbackCoverage();
  }
}

function badgePayload(label, percent) {
  const rounded = Math.round(percent * 10) / 10;
  return {
    schemaVersion: 1,
    label,
    message: `${rounded}%`,
    color: pctColor(rounded),
  };
}

function main() {
  fs.mkdirSync(BADGES_DIR, { recursive: true });

  const code = computeCodeCoveragePercent();
  const sdd = computeSddCoverage();

  writeJson(CODE_BADGE_PATH, badgePayload("code coverage", code.percent));
  writeJson(SDD_BADGE_PATH, badgePayload("sdd coverage", sdd.percent));

  writeJson(METRICS_PATH, {
    generatedAt: new Date().toISOString(),
    codeCoverage: code,
    sddCoverage: sdd,
  });

  console.log(
    JSON.stringify(
      {
        codeCoverage: code,
        sddCoverage: sdd,
      },
      null,
      2,
    ),
  );
}

main();
