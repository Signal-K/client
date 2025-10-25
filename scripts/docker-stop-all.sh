#!/bin/bash

# Gracefully stop all Docker containers
# Usage: ./scripts/docker-stop-all.sh

set -e

echo "⏹️  Stopping Docker containers..."

docker-compose down --remove-orphans

echo "✅ All containers stopped"
echo "💾 Data persisted (volumes retained)"
