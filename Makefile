# Development commands for Clerk + PocketBase
# QUICK START OPTIONS (use these first!)
quick-start:
	@./scripts/docker-quick-start.sh

quick-stop:
	@./scripts/docker-stop-all.sh

docker-status:
	@./scripts/docker-status.sh

# FULL REBUILD (if quick-start fails)
clean-build:
	@./scripts/docker-clean-build.sh

# Traditional Docker commands
up:
	docker-compose -f ops/compose/compose.yml up

build:
	docker-compose -f ops/compose/compose.yml build

up-full:
	yarn && docker-compose -f ops/compose/compose.yml up --build

down:
	docker-compose -f ops/compose/compose.yml down

# Run locally without Docker
dev:
	yarn dev

install:
	yarn install

build-app:
	yarn build

# PocketBase helpers
pb-up:
	docker-compose -f ops/compose/compose.yml up -d pocketbase

pb-down:
	docker-compose -f ops/compose/compose.yml stop pocketbase

pb-logs:
	docker-compose -f ops/compose/compose.yml logs -f pocketbase

pb-import-schema:
	yarn pocketbase:import-schema

pb-check-domains:
	yarn pocketbase:check-domains

pb-map-clerk-users:
	DRY_RUN=$${DRY_RUN:-true} yarn pocketbase:map-clerk-users

pb-backfill-ecosystem-profiles:
	DRY_RUN=$${DRY_RUN:-true} yarn pocketbase:backfill-ecosystem-profiles

pb-restore-legacy-profiles:
	DRY_RUN=$${DRY_RUN:-true} yarn pocketbase:restore-legacy-profiles

pb-backup:
	./scripts/pocketbase/backup.sh

# Production commands (if using Docker for production)
prod-build:
	docker-compose -f ops/compose/docker-compose.prod.yml build

prod-up:
	docker-compose -f ops/compose/docker-compose.prod.yml up -d

prod-down:
	docker-compose -f ops/compose/docker-compose.prod.yml down

prod-logs:
	docker-compose -f ops/compose/docker-compose.prod.yml logs -f

# Clean up Docker
clean:
	docker-compose -f ops/compose/compose.yml down
	docker system prune -f

# Setup for new developers
setup:
	cp .env.example .env.local
	yarn install
	@echo "Please update .env.local with Clerk and PocketBase credentials"
	@echo "Then run 'make pb-up' and 'make dev' to start development"

# Help
help:
	@echo "Available commands:"
	@echo "  dev          - Start development server locally"
	@echo "  up           - Start with Docker"
	@echo "  test-docker  - Run unit & E2E tests in headless Docker (GitHub Actions style)"
	@echo "  sync-surveys - Sync micro-surveys to PostHog using .env.posthog"
	@echo "  down         - Stop Docker containers"
	@echo "  pb-up        - Start local PocketBase"
	@echo "  pb-backup    - Back up local PocketBase data"
	@echo "  setup        - Setup for new developers"

# Docker Testing (Headless E2E + Unit)
# Note: Use 'make build' first if you've changed dependencies or the Dockerfile.
test-docker:
	@if [ ! -f .env.posthog ]; then echo "Warning: .env.posthog not found. PostHog specific tests might fail."; fi
	docker-compose -f ops/compose/docker-compose.test.yml --profile all up --abort-on-container-exit

# PostHog Survey Sync
sync-surveys:
	@if [ ! -f .env.posthog ]; then echo "Error: .env.posthog required for survey sync."; exit 1; fi
	@echo "Syncing surveys to PostHog..."
	@export $$(cat .env.posthog | xargs) && node --experimental-strip-types scripts/sync-posthog-surveys.ts

deploy-test:
	docker-compose -f ops/compose/compose.yml build && yarn build && vercel
