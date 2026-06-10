#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$DIR"

export SKIP_USER_CREATION_TESTS=false

exec scripts/tests/with-local-supabase-env.sh \
  npx start-server-and-test 'yarn test:e2e:server' http://127.0.0.1:3000/auth \
  'scripts/tests/run-cypress.sh --headless --spec cypress/e2e/frontend-supabase-persistence.cy.ts'
