# Docker, Drizzle & Supabase Integration Guide

This document explains how to use Docker with Drizzle ORM and Supabase in the Navigation project.

## Quick Start

1. **Setup for new developers:**
   ```bash
   make setup
   ```

2. **Update your environment variables:**
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_supabase_database_url
   ```

3. **Start development (recommended - local):**
   ```bash
   make dev
   # or simply: yarn dev
   ```

4. **Start Drizzle Studio for database management:**
   ```bash
   make db-studio
   ```

5. **Start development with Docker:**
   ```bash
   make up
   ```

## Available Commands

### Development
- `make dev` - Start development server locally (recommended)
- `make up` - Start with Docker
- `make down` - Stop Docker containers
- `make build` - Build Docker image

### Database Management (Drizzle + Supabase)
- `make db-studio` - Start Drizzle Studio UI (connects to Supabase)
- `make db-studio-down` - Stop Drizzle Studio
- `make db-generate` - Generate Drizzle schema from database
- `make db-push` - Push schema changes to Supabase database

### Supabase (if using Supabase CLI)
- `make supabase-start` - Start local Supabase
- `make supabase-stop` - Stop local Supabase
- `make supabase-status` - Check Supabase status
- `make db-types` - Generate TypeScript types from database

### Production
- `make prod-build` - Build production images
- `make prod-up` - Start production environment
- `make prod-down` - Stop production environment
- `make prod-logs` - View production logs

## Services

### Development (compose.yml)
- **nextapp**: Next.js application with hot reload
  - Uses Supabase for database (no local PostgreSQL container)
  - Connects to your Supabase project via environment variables
- **drizzle-studio**: Database management UI
  - Connects to your Supabase database
  - Available at http://localhost:4983
  - Run with `make db-studio`

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │────│   Supabase DB   │────│ Drizzle Studio  │
│  (localhost:3000)│    │   (Remote)      │    │ (localhost:4983)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Recommended Development Workflow
1. Run the Next.js app locally: `yarn dev`
2. Use Drizzle Studio for database management: `make db-studio`
3. Use Supabase dashboard for auth, storage, and advanced features
4. Use Docker only when you need to test the containerized environment
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
