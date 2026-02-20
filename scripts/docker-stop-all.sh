#!/bin/bash

# Gracefully stop all Docker containers
# Usage: ./scripts/docker-stop-all.sh

set -e
COMPOSE_FILE="ops/compose/compose.yml"

echo "⏹️  Stopping Docker containers..."

docker-compose -f "$COMPOSE_FILE" down --remove-orphans

echo "✅ All containers stopped"
echo "💾 Data persisted (volumes retained)"
