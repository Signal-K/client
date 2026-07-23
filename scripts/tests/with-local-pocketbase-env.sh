#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

export NEXT_PUBLIC_POCKETBASE_URL="${NEXT_PUBLIC_POCKETBASE_URL:-http://localhost:8095}"
export CYPRESS_baseUrl="${CYPRESS_baseUrl:-http://localhost:3000}"

if command -v curl &>/dev/null; then
  if ! curl -fsS "$NEXT_PUBLIC_POCKETBASE_URL/api/health" >/dev/null 2>&1; then
    echo "Warning: PocketBase is not responding at $NEXT_PUBLIC_POCKETBASE_URL - API routes that require PocketBase may fail." >&2
  fi
fi

# Auth runs through Clerk; NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/CLERK_SECRET_KEY
# your shell or .env before running this; ClerkProvider throws without them.
if [ -z "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:-}" ]; then
  echo "Warning: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set - the app will fail to boot until Clerk keys are configured." >&2
fi

exec "$@"
