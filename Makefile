# Development commands for Supabase setup
up:
	docker-compose up

build:
	docker-compose build

up-full:
	yarn && docker-compose up --build

down:
	docker-compose down

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
	supabase gen types typescript --project-id your-project-id --schema public > types/supabase.ts

# Drizzle commands (connected to Supabase)
db-studio:
	docker-compose --profile studio up drizzle-studio

db-studio-down:
	docker-compose --profile studio down

db-generate:
	yarn db:generate

db-push:
	yarn db:push

# Production commands (if using Docker for production)
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Clean up Docker
clean:
	docker-compose down
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
	@echo "  db-studio    - Start Drizzle Studio (database UI)"
	@echo "  db-generate  - Generate Drizzle schema"
	@echo "  db-push      - Push schema changes to Supabase"
	@echo "  setup        - Setup for new developers"
	@echo "  clean        - Clean up Docker containers and images"
	@echo "  supabase-*   - Supabase CLI commands (if installed)"
	docker-compose up postgres -d
	sleep 10
	yarn db:push
	echo "Setup complete! Run 'make dev-with-db' to start development"

deploy-test:
	docker-compose build && yarn build && vercel