#!/usr/bin/env bash
set -euo pipefail

if ! supabase status >/dev/null 2>&1; then
  echo "Starting local Supabase..."
  supabase start
fi

export NODE_ENV="${NODE_ENV:-test}"
export SKIP_USER_CREATION_TESTS="${SKIP_USER_CREATION_TESTS:-true}"
export SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-http://127.0.0.1:54321}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" || -z "${SUPABASE_SERVICE_ROLE_KEY}" ]]; then
  echo "Missing required env vars: NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY"
  echo "Set them in your shell (or .env.local) before running test:suite:local."
  exit 1
fi

unset ELECTRON_RUN_AS_NODE

echo "Running unit tests..."
npm run test:unit

echo "Running e2e tests..."
npx start-server-and-test "npm run dev" http://localhost:3000 "npm run test:e2e:smoke && npm run test:e2e:headless"
