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

# Derive keys from local Supabase when not provided explicitly.
if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" || -z "${SUPABASE_SERVICE_ROLE_KEY}" ]]; then
  STATUS_ENV="$(supabase status -o env 2>/dev/null || true)"
  if [[ -n "${STATUS_ENV}" ]]; then
    LOCAL_PUBLISHABLE="$(printf '%s\n' "${STATUS_ENV}" | sed -n 's/^ANON_KEY=//p' | tail -n1 | sed 's/^"//; s/"$//')"
    LOCAL_SECRET="$(printf '%s\n' "${STATUS_ENV}" | sed -n 's/^SERVICE_ROLE_KEY=//p' | tail -n1 | sed 's/^"//; s/"$//')"
    if [[ -z "${LOCAL_PUBLISHABLE}" ]]; then
      LOCAL_PUBLISHABLE="$(printf '%s\n' "${STATUS_ENV}" | sed -n 's/^PUBLISHABLE_KEY=//p' | tail -n1 | sed 's/^"//; s/"$//')"
    fi
    if [[ -z "${LOCAL_SECRET}" ]]; then
      LOCAL_SECRET="$(printf '%s\n' "${STATUS_ENV}" | sed -n 's/^SECRET_KEY=//p' | tail -n1 | sed 's/^"//; s/"$//')"
    fi
  fi
  if [[ -z "${LOCAL_PUBLISHABLE}" || -z "${LOCAL_SECRET}" ]]; then
    STATUS_TEXT="$(supabase status)"
    LOCAL_PUBLISHABLE="$(printf '%s\n' "${STATUS_TEXT}" | sed -n 's/^| Publishable | \(.*\) |$/\1/p' | tail -n1)"
    LOCAL_SECRET="$(printf '%s\n' "${STATUS_TEXT}" | sed -n 's/^| Secret      | \(.*\) |$/\1/p' | tail -n1)"
  fi

  export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$LOCAL_PUBLISHABLE}"
  export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$LOCAL_SECRET}"
fi

if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" || -z "${SUPABASE_SERVICE_ROLE_KEY}" ]]; then
  echo "Missing Supabase keys. Could not derive NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY from local Supabase."
  exit 1
fi

unset ELECTRON_RUN_AS_NODE

echo "Running unit tests..."
npm run test:unit

echo "Running e2e tests..."
npx start-server-and-test "npm run dev" http://localhost:3000 "npm run test:e2e:smoke && npm run test:e2e:headless"
