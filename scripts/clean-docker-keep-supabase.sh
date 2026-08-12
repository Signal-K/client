#!/bin/bash

# Script to clean Docker while preserving Supabase
# This keeps Supabase images and volumes intact

echo "🧹 Starting Docker cleanup (preserving Supabase)..."

# Stop non-Supabase containers
echo "Stopping non-Supabase containers..."
docker ps -a --filter "name=^(?!supabase_)" --format "{{.ID}}" | xargs -r docker stop 2>/dev/null || true
docker ps -a --filter "name=^(?!supabase_)" --format "{{.ID}}" | xargs -r docker rm 2>/dev/null || true

# Remove dangling volumes (excluding Supabase)
echo "Removing dangling volumes (excluding Supabase)..."
docker volume ls -qf dangling=true | grep -v supabase | xargs -r docker volume rm 2>/dev/null || echo "No dangling volumes to remove"

# Dangling (untagged) images/cache layers are never referenced by any tag or
# container, so they're safe to remove immediately regardless of age — the
# 168h/720h filters below previously applied to these too, which let weeks of
# rebuild churn accumulate tens of GB before the age gate even started
# counting (see docker-clean-build.sh's `dangling=true` filter for the
# pattern this should have followed all along).
echo "Removing dangling images and build cache (age-independent)..."
docker image prune -f
docker builder prune -f

# Clean build cache
echo "Cleaning build cache..."
docker builder prune -af --filter "until=168h" # Keep last week's cache

# Remove images not used by running containers (but will preserve Supabase images when running)
echo "Removing unused images..."
docker image prune -af --filter "until=720h" # Keep images from last 30 days

echo "✅ Cleanup complete!"
echo ""
echo "Current Docker usage:"
docker system df
