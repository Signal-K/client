#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if command -v supabase &>/dev/null; then
  eval "$(supabase status -o env 2>/dev/null)" || true
fi

export SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$SUPABASE_URL}"
export CYPRESS_baseUrl="${CYPRESS_baseUrl:-http://localhost:3000}"

# Auth now runs through Clerk (see .claude/plans/sparkling-cooking-dewdrop.md) —
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/CLERK_SECRET_KEY must already be exported in
# your shell or .env before running this; ClerkProvider throws without them.
if [ -z "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}" ]; then
  echo "Warning: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set — the app will fail to boot until Clerk keys are configured." >&2
fi

exec "$@"
