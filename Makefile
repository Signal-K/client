# Development commands for Supabase setup
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

# Run locally without Docker (recommended for Supabase development)
dev:
	yarn dev

install:
	yarn install

build-app:
	yarn build

# Supabase commands (run these locally, not in Docker)
# Make sure you have Supabase CLI installed
supabase-start:
	supabase start

supabase-stop:
	supabase stop

# Database type generation (if using Supabase CLI)
db-types:
	supabase gen types typescript --project-id your-project-id --schema public > src/types/supabase.ts

# Prisma commands (connected to Supabase Postgres)
db-studio:
	docker-compose -f ops/compose/compose.yml --profile studio up prisma-studio

db-studio-down:
	docker-compose -f ops/compose/compose.yml --profile studio down

db-generate:
	yarn prisma:generate

db-push:
	yarn prisma:migrate:deploy

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
	@echo "Please update .env.local with your Supabase credentials"
	@echo "Then run 'make dev' or 'yarn dev' to start development"

# Help
help:
	@echo "Available commands:"
	@echo "  dev          - Start development server locally (recommended)"
	@echo "  up           - Start with Docker"
	@echo "  down         - Stop Docker containers"
	@echo "  build        - Build Docker image"
	@echo "  db-studio    - Start Prisma Studio (database UI)"
	@echo "  db-generate  - Generate Prisma client"
	@echo "  db-push      - Deploy Prisma migrations"
	@echo "  setup        - Setup for new developers"
	@echo "  clean        - Clean up Docker containers and images"
	@echo "  supabase-*   - Supabase CLI commands (if installed)"

deploy-test:
	docker-compose -f ops/compose/compose.yml build && yarn build && vercel
