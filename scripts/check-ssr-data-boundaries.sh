#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

OFFENDERS_FILE="${TMPDIR:-/tmp}/ssr_client_db_offenders.txt"

rg -l "useSupabaseClient\\(|getSupabaseBrowserClient\\(" app src hooks lib --glob '*.ts' --glob '*.tsx' \
  | xargs rg -l "\\.from\\(" > "$OFFENDERS_FILE" || true

COUNT=$(wc -l < "$OFFENDERS_FILE" | tr -d ' ')

if [ "$COUNT" -gt 0 ]; then
  echo "SSR boundary check failed: found $COUNT client-side DB query files."
  echo "Move these queries behind server APIs or server components:"
  sed -n '1,200p' "$OFFENDERS_FILE"
  exit 1
fi

echo "SSR boundary check passed: no client-side DB query files found."
