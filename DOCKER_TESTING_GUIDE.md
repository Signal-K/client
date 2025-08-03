# Docker Testing Environment Setup 🐳

## Overview
Complete Docker setup for running unit and E2E tests in containerized environments, supporting both CI/CD and local development workflows.

## Files Created

### Docker Files
- `test.dockerfile` - Specialized Dockerfile for testing with Cypress dependencies
- `docker-compose.test.yml` - Complete testing environment with multiple profiles
- Updated `compose.yml` - Added E2E testing service to development stack

### Updated Configuration
- `cypress.config.ts` - Enhanced with Docker-specific settings and environment variables
- `package.json` - Added Docker testing scripts

## Docker Testing Architecture

### 1. Test Dockerfile (`test.dockerfile`)
```dockerfile
# Key features:
- Node.js 22 with Cypress dependencies
- Pre-installed system packages for headless testing
- Optimized for CI/CD environments
- Built-in Cypress cache handling
```

### 2. Development Integration (`compose.yml`)
```yaml
# New service added:
e2e-tests:
  - Runs alongside development server
  - Uses profile-based activation
  - Configured for headless testing
```

### 3. Dedicated Test Environment (`docker-compose.test.yml`)
```yaml
# Multiple testing profiles:
- unit: Unit tests only
- e2e: Headless E2E tests
- local-test: E2E with user creation
- all: Complete test suite
```

## Usage

### Quick Commands

#### Run specific test types:
```bash
# Unit tests only
npm run docker:test:unit

# E2E tests (headless, no user creation)
npm run docker:test:e2e

# E2E tests with user creation (local development)
npm run docker:test:e2e:local

# All tests (unit + E2E)
npm run docker:test:all

# Clean up test containers and volumes
npm run docker:test:clean
```

#### Direct Docker Compose commands:
```bash
# Run E2E tests
docker-compose -f docker-compose.test.yml --profile e2e up --build

# Run all tests
docker-compose -f docker-compose.test.yml --profile all up --build

# Clean up
docker-compose -f docker-compose.test.yml down --volumes
```

### Development Workflow

#### 1. Add testing to development stack:
```bash
# Start development with testing capability
docker-compose --profile test up

# In another terminal, run tests
docker-compose exec e2e-tests yarn test:e2e:headless
```

#### 2. Standalone testing:
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up nextapp-test

# Run tests when ready
docker-compose -f docker-compose.test.yml --profile e2e up
```

## Environment Configuration

### Environment Variables
```env
# .env.local for Docker testing
NODE_ENV=test
SKIP_USER_CREATION_TESTS=true  # Set to false for local testing
CYPRESS_baseUrl=http://nextapp-test:3000  # Auto-configured for Docker
```

### Cypress Configuration
- **Dynamic baseUrl**: Automatically uses Docker service URLs
- **Extended timeouts**: Optimized for container startup times
- **Video recording**: Enabled in CI environments
- **Retry logic**: Built-in test retry for flaky network conditions

## Testing Profiles

### Profile: `unit`
```bash
npm run docker:test:unit
```
- Runs Vitest unit tests only
- Fast execution
- No external dependencies

### Profile: `e2e`
```bash
npm run docker:test:e2e
```
- Headless Cypress tests
- No user creation (CI-friendly)
- Full application testing

### Profile: `local-test`
```bash
npm run docker:test:e2e:local
```
- Includes user creation tests
- Suitable for local development
- Full feature testing

### Profile: `all`
```bash
npm run docker:test:all
```
- Complete test suite
- Unit tests followed by E2E tests
- Comprehensive validation

## CI/CD Integration

### GitHub Actions Integration
```yaml
# Add to your existing workflow:
- name: Run Docker Tests
  run: |
    npm run docker:test:all
    
- name: Upload Test Artifacts
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: test-results
    path: |
      cypress/screenshots
      cypress/videos
```

### Docker Build Optimization
```bash
# Multi-stage builds for production
docker build --target test -f test.dockerfile .

# Cache optimization
docker-compose -f docker-compose.test.yml build --parallel
```

## Troubleshooting

### Common Issues

#### 1. Cypress Cannot Connect
```bash
# Check if app is running
docker-compose -f docker-compose.test.yml logs nextapp-test

# Verify network connectivity
docker-compose -f docker-compose.test.yml exec e2e-tests-headless curl http://nextapp-test:3000
```

#### 2. Permission Issues
```bash
# Fix Cypress cache permissions
docker-compose -f docker-compose.test.yml exec e2e-tests-headless chown -R node:node /app/.cypress
```

#### 3. Out of Memory
```bash
# Increase Docker memory limits
docker-compose -f docker-compose.test.yml up --scale e2e-tests-headless=1
```

### Performance Optimization

#### 1. Build Cache
```bash
# Use Docker buildkit for faster builds
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.test.yml build
```

#### 2. Parallel Testing
```bash
# Run tests in parallel (requires Cypress Dashboard)
docker-compose -f docker-compose.test.yml up --scale e2e-tests-headless=2
```

## Monitoring and Debugging

### View Logs
```bash
# All services
docker-compose -f docker-compose.test.yml logs -f

# Specific service
docker-compose -f docker-compose.test.yml logs -f e2e-tests-headless
```

### Interactive Debugging
```bash
# Enter test container
docker-compose -f docker-compose.test.yml exec e2e-tests-headless bash

# Run tests manually
docker-compose -f docker-compose.test.yml exec e2e-tests-headless yarn test:e2e:open
```

## Best Practices

### 1. Resource Management
- Always clean up containers after testing
- Use profiles to run only necessary services
- Monitor Docker resource usage

### 2. Test Isolation
- Each test profile uses separate containers
- Network isolation between test environments
- Volume mounting for artifact collection

### 3. Environment Consistency
- Same Node.js version across all environments
- Consistent dependency installation
- Environment variable parity

Your Docker testing environment is now fully configured and ready for both local development and CI/CD usage! 🚀
