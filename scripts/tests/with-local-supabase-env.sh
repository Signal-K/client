#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if command -v supabase &>/dev/null; then
  eval "$(supabase status -o env 2>/dev/null)" || true
fi

export SUPABASE_URL="${SUPABASE_URL:-http://127.0.0.1:54321}"
export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$SUPABASE_URL}"
export CYPRESS_baseUrl="${CYPRESS_baseUrl:-http://localhost:3000}"

exec "$@"
