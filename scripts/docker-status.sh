#!/bin/bash

# Check Docker and container status
# Usage: ./scripts/docker-status.sh

echo "🔍 Docker Status Report"
echo "======================="
echo ""

# Docker daemon status
if docker ps &> /dev/null; then
    echo "✅ Docker Daemon: Running"
else
    echo "❌ Docker Daemon: Not running"
    exit 1
fi

echo ""
echo "📊 Active Containers:"
docker ps --filter "network=app-network" --format "table {{.Names}}\t{{.State}}\t{{.Status}}" || echo "   None running"

echo ""
echo "🖥️  Available Images:"
docker images --filter "reference=*node*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | head -5

echo ""
echo "💾 Disk Usage:"
docker system df | grep -E "Images|Containers|Volumes"
