# Development commands
up:
	docker-compose up

build:
	docker-compose build && yarn build

up-full:
	yarn && yarn build && docker-compose up --build

down:
	docker-compose down

down-full:
	docker-compose down -v

up-light:
	docker-compose up -d

# Drizzle ORM commands
db-generate:
	yarn db:generate

db-migrate:
	yarn db:migrate

db-push:
	yarn db:push

db-studio:
	docker-compose --profile studio up drizzle-studio

db-reset:
	docker-compose down postgres -v && docker-compose up postgres -d

# Production commands
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

# Development with database
dev-with-db:
	docker-compose up postgres -d && yarn dev

# Clean up
clean:
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

# Setup for new developers
setup:
	cp .env.example .env.local
	yarn install
	docker-compose up postgres -d
	sleep 10
	yarn db:push
	echo "Setup complete! Run 'make dev-with-db' to start development"

deploy-test:
	docker-compose build && yarn build && vercel