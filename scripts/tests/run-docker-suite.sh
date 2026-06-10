#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

SUITE="${1:-all}"

case "$SUITE" in
  unit)
    docker compose -f "$DIR/ops/compose/docker-compose.test.yml" --profile unit up --build --abort-on-container-exit
    ;;
  e2e)
    docker compose -f "$DIR/ops/compose/docker-compose.test.yml" --profile e2e up --build --abort-on-container-exit
    ;;
  local-test)
    docker compose -f "$DIR/ops/compose/docker-compose.test.yml" --profile local-test up --build --abort-on-container-exit
    ;;
  all)
    docker compose -f "$DIR/ops/compose/docker-compose.test.yml" --profile all up --build --abort-on-container-exit
    ;;
  *)
    echo "Usage: $0 {unit|e2e|local-test|all}"
    exit 1
    ;;
esac
