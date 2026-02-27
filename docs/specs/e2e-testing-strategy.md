---
title: "E2E Testing Strategy"
description: "Cypress end-to-end test suites, CI/CD pipeline strategy, and when each test level runs"
category: "spec"
status: "active"
created: "2026-02-23"
updated: "2026-02-23"
---

# E2E Testing Strategy Update

## Overview
E2E testing has been restructured to optimize CI/CD performance and test coverage based on the branch being tested.

## Test Suites

### `yarn test:e2e:smoke:minimal`
**Runs**: `smoke-critical.cy.ts` (3 tests)
**When**: All commits to non-main branches
**Duration**: ~6 seconds
**Coverage**: Essential smoke tests only
- ✓ Critical auth flows
- ✓ Landing page
- ✓ Basic navigation

### `yarn test:e2e:smoke:full`  
**Runs**: `smoke-critical.cy.ts` + `contributions-critical.cy.ts` (6 tests)
**When**: On-demand or special circumstances
**Duration**: ~15 seconds
**Coverage**: Core critical paths

### `yarn test:e2e` (Full Suite)
**Runs**: All 10 e2e test files (29 tests)
- auth.cy.ts
- contributions-critical.cy.ts
- frontend-supabase-persistence.cy.ts
- navigation.cy.ts
- planets.cy.ts
- project-matrix.cy.ts
- research.cy.ts
- smoke-critical.cy.ts
- user-flows.cy.ts
- working-routes.cy.ts

**When**: 
- All commits to `main` branch
- All PRs to `main` branch

**Duration**: ~2.5 minutes
**Coverage**: Complete application workflows

### `yarn test:e2e:coverage`
**Identical to**: `yarn test:e2e`
**Purpose**: Reports coverage metrics for CI/CD
**Note**: Can be used locally to track E2E coverage

## CI/CD Pipeline

### Non-Main Branch Commits
```
Unit Tests (fast) → Lint → Minimal E2E Smoke Tests → Build
```

### Main Branch Commits
```
Unit Tests (fast) → Lint → Full E2E Suite → Build → Deploy
```

### Pull Request to Main
```
Unit Tests (fast) → Lint → Full E2E Suite (gated) → Auto-merge eligible
```

## Test Execution Time vs Coverage

| Test Level | Duration | Coverage | When |
|-----------|----------|----------|------|
| Unit tests only | ~3-5s | Limited | Never (use with e2e) |
| Unit + Smoke | ~10-15s | ~40% | Non-main branches |
| Unit + Full E2E | ~5-8 min | ~80% | Main + PRs to main |

## Local Development

### Quick validation (before pushing)
```bash
yarn test:unit && yarn test:e2e:smoke:minimal
```

### Full validation before PR (optional)
```bash
yarn test:unit && yarn test:e2e
```

### Coverage report
```bash
yarn test:unit --coverage
```

## Excluded E2E Tests

The following tests are **not** part of the standard pipeline due to environmental requirements or known issues:

- `classification-flow.cy.ts` - Complex flow requiring specific state
- `deployment-flow.cy.ts` - Heavy resource usage
- `mining-inventory.cy.ts` - High memory requirements  
- `social-features.cy.ts` - Pending feature fixes

**Note**: These can be run locally with `yarn test:e2e:local` if needed

## Test Dependencies

### Required environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for tests with Supabase setup)

### Local Supabase (optional for non-main branches)
Tests will work with remote Supabase, but local instances can be used:
```bash
supabase start  # Before running e2e tests
```

## Performance Notes

- Smoke tests: ~6 seconds (minimal, fast feedback)
- Full test suite: ~2.5 minutes (thorough validation)
- Parallel test execution not currently enabled in Cypress
- Consider enabling if test count exceeds 50+ tests

## Adding New E2E Tests

When adding new e2e tests:

1. **Critical path tests** → Add to `smoke-critical.cy.ts`
2. **Feature-specific tests** → Create `feature-name.cy.ts`
3. **Non-critical tests** → Can be excluded from minimal smoke tests

Update the package.json test commands to include new critical tests.

## Troubleshooting

### Tests fail locally but pass in CI
- Ensure Supabase is configured correctly
- Check environment variables are set
- Try `yarn test:e2e:local` to run all tests including skipped ones

### Slow CI/CD times
- Check if running on main (full suite) vs other branches (smoke only)
- Consider increasing timeout if network-dependent
- Profile with: `time yarn test:e2e`

### Port conflicts
- Default port: 3000 for dev server
- Configure with `CYPRESS_BASE_URL` if different
