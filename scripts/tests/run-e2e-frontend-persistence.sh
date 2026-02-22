#!/usr/bin/env bash
set -euo pipefail

supabase start

cleanup() {
  supabase stop
}
trap cleanup EXIT

eval "$(supabase status -o env)"

export DATABASE_URL="${DB_URL}"
export NEXT_PUBLIC_SUPABASE_URL="${API_URL}"
export SUPABASE_URL="${API_URL}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="${ANON_KEY}"
export SUPABASE_SERVICE_ROLE_KEY="${SERVICE_ROLE_KEY}"
export SUPABASE_SECRET_KEY="${SECRET_KEY}"
export CYPRESS_baseUrl="${CYPRESS_baseUrl:-http://localhost:3000}"
export SKIP_USER_CREATION_TESTS=false

env -u ELECTRON_RUN_AS_NODE npx start-server-and-test \
  "yarn dev" \
  "${CYPRESS_baseUrl}" \
  "env -u ELECTRON_RUN_AS_NODE cypress run --headless --spec cypress/e2e/frontend-supabase-persistence.cy.ts"
