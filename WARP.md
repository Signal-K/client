# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Star Sailors** is a Next.js 14 application for space exploration, citizen science, and data classification. It features a complex user-centric architecture with components organized around user mechanics (classification, deployment, discovery, research, social, profile) rather than technical implementation.

## Common Development Commands

### Local Development
```bash
# Start development server (recommended)
yarn dev
# or using Makefile
make dev

# Install dependencies
yarn install
# or
make install

# Build application
yarn build
# or
make build-app
```

### Database Operations (Prisma + Supabase Postgres)
```bash
# Generate Prisma client
yarn prisma:generate

# Pull current database schema
yarn prisma:pull

# Open Prisma Studio (database UI)
yarn prisma:studio
# or via Docker
make db-studio

# Database migrations
yarn prisma:migrate:deploy
```

### Testing

#### Unit Testing (Vitest)
```bash
# Run unit tests
yarn test:unit

# Run unit tests in watch mode
yarn test:unit:watch

# Run unit tests in Docker (isolated)
yarn docker:test:unit
```

#### E2E Testing (Cypress)
```bash
# Run E2E tests headless
yarn test:e2e

# Run E2E tests with Cypress UI
yarn test:e2e:open

# Run E2E tests with user creation (local)
yarn test:e2e:local

# Run E2E tests in Docker
yarn docker:test:e2e
yarn docker:test:e2e:local
```

#### Comprehensive Testing
```bash
# Run all tests (unit + E2E)
yarn test:all
yarn docker:test:all

# Clean Docker test resources
yarn docker:test:clean
```

### Docker Operations
```bash
# Development with Docker
docker-compose -f ops/compose/compose.yml up
# or
make up

# Production deployment
docker-compose -f ops/compose/docker-compose.prod.yml up -d
# or
make prod-up

# Test environment
docker-compose -f ops/compose/docker-compose.test.yml --profile unit up
docker-compose -f ops/compose/docker-compose.test.yml --profile e2e up
```

### Linting and Code Quality
```bash
# Next.js linting
yarn lint

# Detect unused dependencies
yarn knip
```

### Single Test Execution
```bash
# Run specific Cypress test
npx cypress run --spec "cypress/e2e/specific-test.cy.ts"

# Run specific unit test
npx vitest run path/to/test.test.ts

# Run tests matching pattern
npx vitest run --reporter=verbose --grep "test pattern"
```

## Architecture Overview

### File Organization
The codebase uses a **user-centric component architecture** rather than technical grouping:

- **`src/components/classification/`** - Image/data classification mechanics (viewports, telescopes, AI tools)
- **`src/components/deployment/`** - Structure & mission deployment (buildings, equipment, missions)
- **`src/components/discovery/`** - Exploration & data discovery (planets, anomalies, weather)
- **`src/components/research/`** - Scientific progression (projects, skill trees)
- **`src/components/social/`** - Community features (comments, posts, activity)
- **`src/components/profile/`** - User management (auth, dashboard, inventory)
- **`src/components/ui/`** - Reusable UI components
- **`src/components/layout/`** - Application layout components

### Core Architecture
- **`app/`** - Next.js 14 App Router with file-based routing
- **`src/core/`** - Core application logic and context providers
- **`src/shared/`** - Shared utilities and helper functions
- **`lib/`** - External library configurations
- **`hooks/`** - Custom React hooks
- **`types/`** - TypeScript type definitions

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: Supabase Postgres with Prisma ORM
- **3D Graphics**: Three.js with React Three Fiber
- **Testing**: Vitest (unit), Cypress (E2E)
- **Styling**: Tailwind CSS, Radix UI, Framer Motion
- **Auth**: Supabase Auth with NextAuth helpers

### Import Patterns
```typescript
// Absolute imports using @ alias
import { Component } from '@/src/components/classification/...'
import { utility } from '@/src/shared/utils'
import { type } from '@/types/...'

// UI components
import { Button } from '@/src/components/ui/button'
```

### Environment Configuration
- **`.env`** - Production environment variables
- **`.env.local`** - Local development overrides
- **`.env.example`** - Template with required variables
- **`.env.test`** - Testing environment configuration

### Docker Architecture

#### Container Services
- **nextapp**: Main Next.js application container
- **nextapp-test**: Test application server
- **unit-tests**: Isolated unit testing service
- **e2e-tests-headless**: Headless E2E testing
- **e2e-tests-local**: Local E2E testing with user creation
- **db**: PostgreSQL database
- **redis**: Redis cache
- **prisma-studio**: Database UI tool

#### Testing Profiles
- **`unit`**: Fast, isolated unit testing
- **`e2e`**: Full application integration testing
- **`local-test`**: Comprehensive testing with user creation
- **`all`**: Complete test suite validation

### Flask API Integration
The application integrates with a Flask backend for citizen science features:
- Flask routes are proxied through Next.js using `/citizen/*` paths
- Development uses `http://flask:5001` container communication
- API routes remain at `/api/*` for Next.js server functions

### Key Development Notes
- Components are organized by **user mechanics** not technical implementation
- Database schema is managed through Prisma in `prisma/schema.prisma`
- All routes have been validated for the user-centric reorganization
- Docker testing environment provides consistent CI/CD integration
- Three.js components use React Three Fiber patterns
- Supabase handles authentication, real-time subscriptions, and data storage

### Testing Strategy
- **Unit tests** focus on individual component logic and utilities
- **E2E tests** cover complete user workflows and integration scenarios
- **Docker profiles** enable different testing scopes (unit, e2e, combined)
- Tests can skip user creation with `SKIP_USER_CREATION_TESTS=true`
