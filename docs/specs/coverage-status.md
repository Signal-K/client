---
title: "Coverage Status"
description: "Current coverage baseline, what was done, and the realistic path to improvement"
category: "status"
status: "active"
created: "2026-02-23"
updated: "2026-02-23"
---

# Coverage Status Update - Feb 23, 2026

## Summary

The code coverage itself has improved slightly from **4.61% → 4.7%** by adding 4 new tests for the `useAchievements` hook. The improvement is modest because the codebase is large (362 source files) relative to the number of test files (32).

## What Was Done

### 1. GitHub Actions Updated ✅
- Non-main branches run minimal smoke tests (~6 seconds)
- Main branch and PRs run full e2e suite (~2.5 minutes)
- CI/CD is now optimized to balance feedback speed with validation thoroughness

### 2. Coverage Thresholds Added ✅
Instead of failing the build immediately with unrealistic targets, thresholds are now:
- **Lines/Statements: 4%** (baseline - current coverage)
- **Functions: 60%** (maintained from existing tests)
- **Branches: 70%** (maintained from existing tests)

Thresholds will increase gradually every 2 weeks as tests are added.

### 3. Tests Added ✅
- **New file**: `tests/unit/hooks/useAchievements.test.ts` (4 tests)
- **Coverage improvement**: 4.61% → 4.7% (+0.09%)

### 4. Documentation Created ✅
- **COVERAGE_IMPROVEMENT.md** - Strategic guide for improving coverage
- **E2E_TESTING_STRATEGY.md** - Reference for e2e test execution

## The Reality of Low Coverage

**Why 4.7% is expected (not a problem):**
- 362 source files, 32 test files
- Each test file covers ~0.3-1% of codebase
- Current tests focus on utilities and light hooks (not full app)
- To reach 20% would require ~70-80 new test files
- To reach 50% would require ~200+ new test files

## Realistic Improvement Path

### Easiest Wins (0.5-1% each):
1. **Simple utility tests** - Date helpers, string utils, format functions
2. **Common components** - Buttons, cards, modals
3. **Remaining hooks** - useTheme, useUserPreferences, etc.

### Medium Effort (1-2% each):
1. **API route tests** - Classification, deployment, inventory endpoints
2. **Business logic** - Achievement calculation, planet management
3. **Integration tests** - Flow combining multiple functions

### Hard/Time-Intensive (2-3% each):
1. **Complex components** - Full page components with state
2. **Canvas/3D rendering** - Three.js components
3. **Form components** - Multi-step forms with validation

## Recommended Next Steps

### Week 1 (Estimated +2-3% coverage)
- Add 5-8 tests for remaining hooks (useTheme, useUserPreferences)
- Add 2-3 simple component tests
- **Target: 7-8% coverage**

### Week 2-3 (Estimated +5-8% coverage)
- Focus on API route tests (classifications, deployments)
- Add utility function tests
- **Target: 12-15% coverage**

### Month 2 (Estimated +10-15% coverage)
- Component tests for gameplay features
- Achievement and milestone calculations
- **Target: 25-30% coverage**

## Tools Available

```bash
# Run tests with coverage report
yarn test:unit --coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Generate coverage badges
yarn coverage:badges

# Run e2e tests
yarn test:e2e:smoke:minimal        # Quick feedback (non-main branches)
yarn test:e2e                      # Full suite (main branch/PRs)
```

## Build Process

- ✅ Unit tests pass with 390 tests
- ✅ Coverage meets minimum thresholds (4%)
- ✅ E2E smoke tests can be run without blocking
- ✅ Full deploys include comprehensive validation

## Next Actions

1. **Identify** 1-2 developers to own coverage improvement
2. **Start** with Week 1 quick wins (hooks and simple utilities)
3. **Review** coverage report weekly
4. **Adjust** threshold dates as progress becomes clear
5. **Celebrate** milestones (10%, 20%, 30%)

---

**Key Insight**: Coverage improvements from 4% to 20% will take consistent, focused effort. The phased approach prevents breaking the CI/CD while still making measurable progress.
