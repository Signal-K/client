#!/bin/bash

# Clean rebuild - use when quick-start fails
# This removes old images and rebuilds from scratch
# Usage: ./scripts/docker-clean-build.sh

set -e
COMPOSE_FILE="ops/compose/compose.yml"

echo "🧹 Cleaning Docker resources..."

# Stop and remove containers
docker-compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true

# Remove dangling images (saves space)
echo "🗑️  Removing dangling images..."
docker image prune -f --filter "dangling=true" 2>/dev/null || true

# Remove unused networks
docker network prune -f 2>/dev/null || true

echo "🔨 Building and starting fresh..."
docker-compose -f "$COMPOSE_FILE" up -d --build

if [ $? -eq 0 ]; then
    echo "✅ Docker containers rebuilt and started"
    echo "📊 Running containers:"
    docker ps --filter "network=app-network" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Build failed - check Docker daemon"
    exit 1
fi
