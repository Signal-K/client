#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="${POCKETBASE_COMPOSE_FILE:-$ROOT_DIR/ops/compose/compose.yml}"
BACKUP_DIR="${POCKETBASE_BACKUP_DIR:-$ROOT_DIR/backups/pocketbase}"
SERVICE="${POCKETBASE_SERVICE:-pocketbase}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUTPUT="$BACKUP_DIR/pocketbase-$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

if ! docker compose -f "$COMPOSE_FILE" ps --status running --services | grep -Fxq "$SERVICE"; then
  echo "PocketBase service '$SERVICE' is not running in $COMPOSE_FILE" >&2
  exit 1
fi

echo "Creating PocketBase backup: $OUTPUT"
docker compose -f "$COMPOSE_FILE" exec -T "$SERVICE" \
  tar -czf - -C /pb_data . > "$OUTPUT"

echo "Backup complete: $OUTPUT"
