# Docker & Drizzle Integration Guide

This document explains how to use Docker with Drizzle ORM in the Navigation project.

## Quick Start

1. **Setup for new developers:**
   ```bash
   make setup
   ```

2. **Start development with database:**
   ```bash
   make dev-with-db
   ```

3. **Access Drizzle Studio:**
   ```bash
   make db-studio
   ```

## Available Commands

### Development
- `make up` - Start all services
- `make up-full` - Build and start with full setup
- `make down` - Stop all services
- `make dev-with-db` - Start only database, run Next.js locally

### Database Management
- `make db-generate` - Generate Drizzle schema
- `make db-push` - Push schema changes to database
- `make db-studio` - Open Drizzle Studio UI
- `make db-reset` - Reset database (removes all data)

### Production
- `make prod-build` - Build production images
- `make prod-up` - Start production environment
- `make prod-down` - Stop production environment
- `make prod-logs` - View production logs

## Services

### Development (compose.yml)
- **postgres**: PostgreSQL 15 database
- **nextapp**: Next.js application with hot reload
- **drizzle-studio**: Database management UI (optional)

### Production (docker-compose.prod.yml)
- **postgres**: PostgreSQL with persistent data
- **nextapp**: Production-optimized Next.js build
- **nginx**: Reverse proxy (optional)

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/navigation"

# Production database settings
POSTGRES_DB=navigation
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Next.js
NODE_ENV=development
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

## Database Schema Management

The project uses Drizzle ORM for database management:

1. **Schema Location**: `src/core/database/schema.ts`
2. **Migrations**: `src/core/database/migrations/`
3. **Configuration**: `drizzle.config.ts`

### Making Schema Changes

1. Edit `src/core/database/schema.ts`
2. Generate migration: `make db-generate`
3. Apply changes: `make db-push`

## File Structure

```
├── src/core/database/          # Drizzle database layer
│   ├── schema.ts              # Database schema
│   ├── index.ts               # Database connection
│   └── migrations/            # Generated migrations
├── Dockerfile                 # Production build
├── next.dockerfile           # Development build
├── compose.yml               # Development services
├── docker-compose.prod.yml   # Production services
├── init.sql                  # Database initialization
└── drizzle.config.ts         # Drizzle configuration
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if postgres is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Reset database
make db-reset
```

### Migration Issues
```bash
# Regenerate schema
make db-generate

# Force push schema (destructive)
make db-push
```

### Container Issues
```bash
# Clean up everything
make clean

# Rebuild from scratch
make setup
```

## Production Deployment

1. **Configure environment:**
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production values
   ```

2. **Build and deploy:**
   ```bash
   make prod-build
   make prod-up
   ```

3. **Monitor:**
   ```bash
   make prod-logs
   ```

## Security Notes

- Change default database credentials in production
- Use strong passwords and secrets
- Configure SSL/TLS for production database connections
- Review and update the nginx configuration for production use
