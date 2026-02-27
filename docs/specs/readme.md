---
title: "Star Sailors - Client Application"
description: "Overview, setup, testing, and deployment guide for the Star Sailors Next.js client application"
category: "guide"
status: "active"
created: "2026-02-23"
updated: "2026-02-23"
---

# Star Sailors - Client Application

A Next.js application for space exploration, citizen science, and data classification.

[![Coverage Badges Workflow](https://github.com/signal-k/client/actions/workflows/coverage-badges.yml/badge.svg)](https://github.com/signal-k/client/actions/workflows/coverage-badges.yml)
[![Code Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/signal-k/client/main/.github/badges/code-coverage.json)](https://github.com/signal-k/client/actions/workflows/coverage-badges.yml)
[![SDD Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/signal-k/client/main/.github/badges/sdd-coverage.json)](https://github.com/signal-k/client/actions/workflows/coverage-badges.yml)

## 🚀 Quick Start

### Setup:

```bash
docker compose up -d db
docker exec -it starsailors_db psql -U postgres
\l
docker compose build flaskapp
docker compose up -d flaskapp
```

## 🐳 Docker Testing Environment

The project includes a comprehensive Docker-based testing infrastructure for consistent, isolated testing across development and CI/CD environments.

### Quick Reference

| Command | Purpose | Environment |
|---------|---------|-------------|
| `npm run docker:test:unit` | Fast unit testing | Isolated container |
| `npm run docker:test:e2e` | E2E testing (headless) | App + test containers |
| `npm run docker:test:e2e:local` | E2E with user creation | Full test environment |
| `npm run docker:test:all` | Complete test suite | Unit + E2E combined |
| `npm run docker:test:clean` | Cleanup resources | Remove containers/volumes |

### Available Docker Commands

#### Quick Commands
```bash
# Run unit tests in Docker
npm run docker:test:unit

# Run E2E tests in Docker (requires application server)
npm run docker:test:e2e

# Run E2E tests locally (with user creation)
npm run docker:test:e2e:local

# Run all tests (unit + E2E)
npm run docker:test:all

# Clean up Docker resources
npm run docker:test:clean

# Manual build (if needed)
docker-compose -f ops/compose/docker-compose.test.yml build

# Start test application server manually
docker-compose -f ops/compose/docker-compose.test.yml up nextapp-test
```

#### Docker Compose Profiles

The testing environment supports multiple profiles for different testing scenarios:

```bash
# Unit tests only - Fast, isolated unit testing
docker-compose -f ops/compose/docker-compose.test.yml --profile unit up

# E2E tests only - Full application integration testing
docker-compose -f ops/compose/docker-compose.test.yml --profile e2e up

# Local E2E tests - Comprehensive testing with user creation
docker-compose -f ops/compose/docker-compose.test.yml --profile local-test up

# All tests - Complete test suite validation
docker-compose -f ops/compose/docker-compose.test.yml --profile all up
```

#### Advanced Docker Commands

```bash
# Build with no cache
docker-compose -f ops/compose/docker-compose.test.yml build --no-cache

# Run specific service
docker-compose -f ops/compose/docker-compose.test.yml run --rm unit-tests yarn test:unit --run

# Interactive debugging
docker-compose -f ops/compose/docker-compose.test.yml run --rm unit-tests bash

# Check service status
docker-compose -f ops/compose/docker-compose.test.yml ps

# Follow logs in real-time
docker-compose -f ops/compose/docker-compose.test.yml logs -f

# Clean up containers and networks
docker-compose -f ops/compose/docker-compose.test.yml down --remove-orphans
```

### Docker Configuration Files

#### `ops/docker/test.dockerfile`
Specialized Docker image for testing with Cypress dependencies:
- **Base**: Node.js 22 on Debian Bullseye
- **Features**: Pre-installed GUI libraries for headless browser testing
- **Optimizations**: Cypress cache handling, CI-ready environment
- **Purpose**: Runs both unit tests and E2E tests

#### `ops/docker/next.dockerfile`
Production-ready Docker image for the Next.js application:
- **Base**: Node.js 22 with optimized layers
- **Features**: Multi-stage build with production optimizations
- **Purpose**: Main application container for deployment

#### Docker Compose Files

| File | Purpose | Usage |
|------|---------|-------|
| `ops/compose/compose.yml` | Development environment | `docker-compose -f ops/compose/compose.yml up` |
| `ops/compose/docker-compose.test.yml` | Testing environment | `docker-compose -f ops/compose/docker-compose.test.yml up` |
| `ops/compose/docker-compose.prod.yml` | Production deployment | `docker-compose -f ops/compose/docker-compose.prod.yml up` |

#### Development Environment
```bash
# Start development services
docker-compose -f ops/compose/compose.yml up -d

# Start with specific services
docker-compose -f ops/compose/compose.yml up -d nextapp

# View logs
docker-compose -f ops/compose/compose.yml logs -f nextapp
```

#### Production Deployment
```bash
# Build and start production environment
docker-compose -f ops/compose/docker-compose.prod.yml up -d

# Scale services
docker-compose -f ops/compose/docker-compose.prod.yml up -d --scale nextapp=3
```

#### `ops/compose/docker-compose.test.yml`
Multi-service orchestration for comprehensive testing:
- **nextapp-test**: Test application server (development mode)
- **unit-tests**: Isolated unit testing service
- **e2e-tests-headless**: Headless E2E testing
- **e2e-tests-local**: Local E2E testing with user creation
- **all-tests**: Combined unit + E2E test execution

#### `.env.test`
Test environment configuration:
```bash
NODE_ENV=test
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_key
SKIP_USER_CREATION_TESTS=true
```

### Testing Workflows

#### Development Workflow
```bash
# 1. Local development with rapid feedback
npm test

# 2. Feature validation with Docker
npm run docker:test:unit

# 3. Pre-commit comprehensive testing
npm run docker:test:all
```

#### CI/CD Integration
```bash
# 1. Build phase
docker-compose -f ops/compose/docker-compose.test.yml build

# 2. Unit tests (fast feedback)
docker-compose -f ops/compose/docker-compose.test.yml --profile unit up --abort-on-container-exit

# 3. Integration tests (comprehensive validation)
docker-compose -f ops/compose/docker-compose.test.yml --profile e2e up --abort-on-container-exit

# 4. Deployment gate (full test suite)
docker-compose -f ops/compose/docker-compose.test.yml --profile all up --abort-on-container-exit
```

### Container Architecture

| Service | Purpose | Port | Health Check |
|---------|---------|------|--------------|
| `nextapp-test` | Test application server | 3000 | HTTP endpoint |
| `unit-tests` | Unit testing execution | - | Exit code |
| `e2e-tests-headless` | Headless E2E testing | - | Service dependency |
| `e2e-tests-local` | Local E2E with user creation | - | Service dependency |
| `all-tests` | Combined test suite | - | Sequential execution |

### Benefits

- **🔄 Consistency**: Same testing environment across all machines
- **🛡️ Isolation**: Tests run in clean containers with controlled dependencies
- **⚡ Flexibility**: Choose appropriate test scope with profiles
- **📊 Monitoring**: Health checks and logging for debugging  
- **🚀 CI/CD Ready**: Optimized for continuous integration pipelines
- **📈 Scalable**: Easy parallel execution and cloud deployment

### Troubleshooting

#### Common Issues and Solutions

```bash
# Clean rebuild if containers are corrupted
docker-compose -f ops/compose/docker-compose.test.yml build --no-cache

# Remove all containers and networks
docker-compose -f ops/compose/docker-compose.test.yml down --remove-orphans --volumes

# Check container resource usage
docker stats

# Inspect container configuration
docker-compose -f ops/compose/docker-compose.test.yml config

# Debug network connectivity
docker-compose -f ops/compose/docker-compose.test.yml exec nextapp-test curl -f http://localhost:3000

# Check Docker daemon status
docker system info

# Clean up unused Docker resources
docker system prune -a
```

#### Environment Variables

If tests fail due to missing environment variables:
1. Verify `.env.test` exists and contains proper values
2. Check that services are using the correct env_file in ops/compose/docker-compose.test.yml
3. Ensure environment variables are properly set in container

#### Performance Optimization

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose -f ops/compose/docker-compose.test.yml build

# Run tests in parallel (where supported)
docker-compose -f ops/compose/docker-compose.test.yml up --parallel

# Limit container resources if needed
docker-compose -f ops/compose/docker-compose.test.yml up --scale unit-tests=1
```

For detailed Docker testing documentation, see [`DOCKER_TESTING_GUIDE.md`](./DOCKER_TESTING_GUIDE.md).

## 📁 Project Structure

### Component Architecture

The application uses a **user-centric component organization** based on key user mechanics rather than technical implementation:

```
src/components/
├── 🔍 classification/     # Image/data classification mechanics
│   ├── viewport/          # Analysis viewports & tools
│   ├── telescope/         # Telescope classification system
│   └── tools/            # AI classifiers & analysis tools
│
├── 🚀 deployment/         # Structure & mission deployment
│   ├── structures/        # Building & managing structures
│   ├── equipment/         # Equipment management
│   └── missions/          # Mission planning & execution
│
├── 🌍 discovery/          # Exploration & data discovery
│   ├── planets/           # Planet exploration
│   ├── anomalies/         # Anomaly discovery
│   ├── data-sources/      # Data generators & sources
│   └── weather/           # Weather discovery
│
├── 🔬 research/           # Scientific progression
│   ├── projects/          # Research projects
│   └── SkillTree/         # Skill progression system
│
├── 👥 social/             # Community & sharing features
│   ├── comments/          # Commenting system
│   ├── posts/             # Post sharing
│   └── activity/          # Social activity feeds
│
├── 👤 profile/            # User management & authentication
│   ├── auth/              # Authentication & landing pages
│   ├── setup/             # Profile setup & management
│   ├── dashboard/         # User dashboard components
│   └── inventory/         # User inventory management
│
├── 🎨 ui/                 # Reusable UI components
│   ├── icons/             # Custom icons
│   ├── scenes/            # 3D scenes & graphics
│   └── helpers/           # UI utilities & helpers
│
├── 📐 layout/             # Application layout components
└── 🔌 providers/          # React context providers
```

### Key Directories

#### App Router Structure
- `app/` - Next.js 14 app router with file-based routing
- `app/api/` - Server-side API routes
- `app/(routes)/` - Page components and layouts

#### Core Application
- `src/core/` - Core application logic and context
- `src/shared/` - Shared utilities and helper functions
- `lib/` - External library configurations
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions

#### Styling & Assets
- `styles/` - Global CSS and animations
- `public/` - Static assets and images

## 🎯 Component Organization Philosophy

### User-Centric Design
Components are organized by **what users do** rather than technical implementation:

- **Classification**: Users analyze images, classify data, use telescopes
- **Deployment**: Users build structures, manage equipment, plan missions  
- **Discovery**: Users explore planets, find anomalies, discover data
- **Research**: Users progress scientifically, unlock technologies
- **Social**: Users comment, share posts, see community activity
- **Profile**: Users manage accounts, authenticate, track inventory

### Benefits
1. **Intuitive Navigation**: Developers can easily find components by user functionality
2. **Feature Isolation**: Changes to one user mechanic don't affect others
3. **Reusable UI**: Common UI components are properly separated
4. **Clear Dependencies**: Import paths clearly show component relationships
5. **Easier Testing**: Test files can be organized by user feature

## 🛠️ Development Guidelines

### Import Patterns
- Use absolute imports: `@/src/components/classification/...`
- UI components: `@/src/components/ui/...`
- Types: `@/types/...`
- Utilities: `@/src/shared/...`

### Adding New Components
1. Identify the primary user mechanic
2. Place in appropriate feature directory
3. Use UI components from `@/src/components/ui/`
4. Follow existing naming conventions

<!--
Add     "@ducanh2912/next-pwa": "^10.2.9", back
-->

## 🚦 Route Validation

All internal navigation routes have been validated to ensure they point to the correct paths after the reorganization:

- ✅ **Authentication routes**: Updated `/login` → `/auth`
- ✅ **Deployment routes**: Updated `/deploy` → `/activity/deploy`
- ✅ **Planet navigation**: Updated `/scenes/planet` → `/planets/[id]` with proper dynamic routing
- ✅ **Build validation**: All routes compile successfully and generate proper static/dynamic pages

### 📋 Available Routes

- **Core Pages**: `/`, `/account`, `/auth`, `/privacy`, `/terms`, `/tests`
- **Research**: `/research`, `/research/tree`
- **Discovery**: `/planets/[id]`, `/planets/clouds/[id]`, `/planets/edit/[id]`, `/planets/paint/[id]`
- **Social**: `/posts/[id]`, `/posts/surveyor/[id]`
- **Deployment**: `/activity/deploy`
- **Structures**: `/structures/balloon`, `/structures/cameras`, `/structures/seiscam`, `/structures/telescope`
- **Dynamic Structure Routes**: Various `[project]`, `[id]`, and `[mission]` parameters
- **API Endpoints**: Comprehensive gameplay, research, and data upload APIs

All routes maintain backward compatibility while following the new user-centric architecture.
```
