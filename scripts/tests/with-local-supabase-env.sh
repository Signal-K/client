#!/usr/bin/env bash
set -euo pipefail

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is required for local e2e env bootstrap." >&2
  exit 1
fi

if ! supabase status >/dev/null 2>&1; then
  echo "Starting local Supabase..."
  supabase start >/dev/null
fi

STATUS_ENV="$(supabase status -o env 2>/dev/null || true)"
if [[ -z "${STATUS_ENV}" ]]; then
  echo "Could not read local Supabase env via 'supabase status -o env'." >&2
  exit 1
fi

read_env_value() {
  local key="$1"
  printf '%s\n' "${STATUS_ENV}" | sed -n "s/^${key}=//p" | tail -n1 | sed 's/^"//; s/"$//'
}

DB_URL_VALUE="${DATABASE_URL:-$(read_env_value DB_URL)}"
API_URL_VALUE="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-$(read_env_value API_URL)}}"
ANON_KEY_VALUE="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-$(read_env_value ANON_KEY)}"
SERVICE_ROLE_VALUE="${SUPABASE_SERVICE_ROLE_KEY:-$(read_env_value SERVICE_ROLE_KEY)}"
SECRET_KEY_VALUE="${SUPABASE_SECRET_KEY:-$(read_env_value SECRET_KEY)}"

if [[ -z "${ANON_KEY_VALUE}" ]]; then
  ANON_KEY_VALUE="$(read_env_value PUBLISHABLE_KEY)"
fi
if [[ -z "${SECRET_KEY_VALUE}" ]]; then
  SECRET_KEY_VALUE="$(read_env_value SECRET_KEY)"
fi

if [[ -z "${DB_URL_VALUE}" || -z "${API_URL_VALUE}" ]]; then
  echo "Missing DB_URL/API_URL from local Supabase env." >&2
  exit 1
fi

export DATABASE_URL="${DB_URL_VALUE}"
export SUPABASE_URL="${API_URL_VALUE}"
export NEXT_PUBLIC_SUPABASE_URL="${API_URL_VALUE}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${ANON_KEY_VALUE}"
export SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_VALUE}"
export SUPABASE_SECRET_KEY="${SECRET_KEY_VALUE}"

exec "$@"
