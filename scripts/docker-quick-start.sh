#!/bin/bash

# Quick start Docker without full rebuild
# Usage: ./scripts/docker-quick-start.sh

set -e
COMPOSE_FILE="ops/compose/compose.yml"

echo "🚀 Quick Starting Docker (no rebuild)..."

# Only use existing images, don't build
docker-compose -f "$COMPOSE_FILE" up -d --no-build

if [ $? -eq 0 ]; then
    echo "✅ Docker containers started successfully"
    echo "📊 Running containers:"
    docker ps --filter "network=app-network" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Failed to start containers with existing images"
    echo "💡 Tip: Run './scripts/docker-clean-build.sh' for a full rebuild"
    exit 1
fi
