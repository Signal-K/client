#!/usr/bin/env bash
set -euo pipefail

PROFILE="${1:-all}"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is required for docker test bootstrap."
  exit 1
fi

if ! supabase status >/dev/null 2>&1; then
  echo "Starting local Supabase..."
  supabase start >/dev/null
fi

STATUS_ENV="$(supabase status -o env 2>/dev/null || true)"

read_env_value() {
  local key="$1"
  printf '%s\n' "${STATUS_ENV}" | sed -n "s/^${key}=//p" | tail -n1 | sed 's/^"//; s/"$//'
}

LOCAL_DB_URL="$(read_env_value DB_URL)"
LOCAL_API_URL="$(read_env_value API_URL)"
LOCAL_ANON_KEY="$(read_env_value ANON_KEY)"
LOCAL_SERVICE_ROLE_KEY="$(read_env_value SERVICE_ROLE_KEY)"
LOCAL_SECRET_KEY="$(read_env_value SECRET_KEY)"

if [[ -z "${LOCAL_ANON_KEY}" ]]; then
  LOCAL_ANON_KEY="$(read_env_value PUBLISHABLE_KEY)"
fi
if [[ -z "${LOCAL_SERVICE_ROLE_KEY}" ]]; then
  LOCAL_SERVICE_ROLE_KEY="$(read_env_value SECRET_KEY)"
fi

if [[ -z "${LOCAL_API_URL}" || -z "${LOCAL_DB_URL}" || -z "${LOCAL_ANON_KEY}" || -z "${LOCAL_SERVICE_ROLE_KEY}" ]]; then
  echo "Could not derive complete local Supabase env from 'supabase status -o env'."
  exit 1
fi

to_docker_host_url() {
  local value="$1"
  value="${value/127.0.0.1/host.docker.internal}"
  value="${value/localhost/host.docker.internal}"
  printf '%s\n' "${value}"
}

export DATABASE_URL="${DATABASE_URL:-$(to_docker_host_url "${LOCAL_DB_URL}")}"
export SUPABASE_URL="${SUPABASE_URL:-$(to_docker_host_url "${LOCAL_API_URL}")}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-${SUPABASE_URL}}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-${LOCAL_ANON_KEY}}"
export SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-${LOCAL_SERVICE_ROLE_KEY}}"
export SUPABASE_SECRET_KEY="${SUPABASE_SECRET_KEY:-${LOCAL_SECRET_KEY:-${LOCAL_SERVICE_ROLE_KEY}}}"

echo "Running docker test profile: ${PROFILE}"
docker compose -f ops/compose/docker-compose.test.yml --profile "${PROFILE}" up --build --abort-on-container-exit
