---
title: "Code Coverage Improvement Guide"
description: "Strategy, priorities, and phased thresholds for improving unit test coverage from the current baseline"
category: "spec"
status: "active"
created: "2026-02-23"
updated: "2026-02-23"
---

# Code Coverage Improvement Guide

## Current State
- **Overall Coverage**: 4.7% (as of Feb 23, 2026) - improved from 4.61%
- **Test Files**: 32 (added useAchievements.test.ts)
- **Source Files**: ~362
- **Test-to-Source Ratio**: 1:11.3
- **Tests Added Today**: 4 new tests for useAchievements hook

## Coverage Breakdown
Current thresholds set in `vitest.config.ts`:
- Lines: 4% minimum (baseline - current is 4.7%)
- Functions: 60% minimum (maintain - current is 61.12%)
- Branches: 70% minimum (maintain - current is 73.82%)
- Statements: 4% minimum (baseline - current is 4.7%)

## Why Coverage is Low

The codebase has **~362 source files** but only **32 test files**. To meaningfully improve coverage:
- Each new test file typically covers 0.3-1% of codebase
- Tests added today improved coverage by 0.09% (4.61% → 4.7%)
- Focus on high-impact files (heavily used utilities, common components)
- 70-80 new tests could get us to 20% coverage
- 200+ new tests would be needed to reach 50% coverage

## Phased Threshold Increases

To prevent build failures while improving coverage, thresholds will be increased incrementally:

| Date | Lines | Statements | Functions | Branches |
|------|-------|-----------|-----------|----------|
| Current (Feb 23) | 4% | 4% | 60% | 70% |
| March 9 | 6% | 6% | 60% | 70% |
| March 23 | 8% | 8% | 60% | 70% |
| April 6 | 12% | 12% | 60% | 70% |
| April 20 | 15% | 15% | 60% | 70% |

## Priority Areas for Testing

### Tier 1: Critical Utilities & Helpers (High Impact, High Usage)
These utilities are used throughout the application and should have 80%+ coverage:

**src/utils/**
- `solarEventUtils.ts` - ✅ Has tests
- `discoveries.ts` - ✅ Has tests
- Add missing tests for other utility files
- Target: 80% coverage

**src/lib/gameplay/**
- `classification-configuration.ts` - ✅ Has tests
- `classification-vote.ts` - ✅ Has tests
- Add tests for:
  - Planet management utilities
  - Achievement calculation logic
  - Inventory management utilities
- Target: 70% coverage

### Tier 2: API Routes & Server Logic
These handle data fetching and critical business logic:

**src/app/api/gameplay/**
- Endpoints for classifications, deployments, inventory, research
- Focus on:
  - Input validation
  - Error handling
  - Data transformations
- Target: 60% coverage

**src/app/api/auth/**
- Authentication endpoints
- Target: 70% coverage

### Tier 3: React Hooks
Custom hooks should have good coverage as they encapsulate logic:

**src/hooks/**
- `usePageData.ts` - ✅ Has tests
- `useAuth.ts` - Add tests
- `useGameplay.ts` - Add tests (if exists)
- `useInventory.ts` - Add tests (if exists)
- Target: 60% coverage

### Tier 4: Core Components
Focus on components with business logic and state management:

**src/components/** (Priority Order)
1. Gameplay-related components
2. Game state transition components
3. Data display/visualization components
4. Form components
5. UI-only presentational components
- Target: 40% coverage (focus on logic, not presentation)

### Tier 5: Feature Modules
Feature-specific logic and business rules:

**src/features/**
- Add tests for feature-specific utilities and services
- Target: 40% coverage

## Steps to Improve Coverage

### 1. **Assessment Phase** (Week 1)
- [ ] Run coverage reports with detailed file-level breakdown
- [ ] Identify files with 0% coverage
- [ ] Categorize files by test difficulty
- [ ] Assign ownership of coverage for different modules

### 2. **Quick Wins** (Week 1-2)
Start with utilities and hooks that are easy to test:

**Immediate Next Tests to Write** (~10-15 min each):
1. ~~`tests/unit/hooks/useAchievements.test.ts`~~ ✅ **DONE** - Added 4 tests
2. `tests/unit/lib/achievements.test.ts` - Fetch & transform logic
3. `tests/unit/components/common/Button.test.tsx` - Simple button component
4. `tests/unit/utils/date-utils.test.ts` - Common date helpers (if they exist)
5. `tests/unit/lib/string-utils.test.ts` - Common string helpers (if they exist)

**Each of these can add 0.5-1% coverage independently.**

### 3. **Core Logic** (Week 2-3)
Add tests for business logic in:
- Utility functions (target 70%)
- API route handlers (target 60%)
- Custom hooks (target 60%)

### 4. **Sustained Growth** (Week 4+)
Gradually increase coverage as part of regular development:
- Every new feature should include tests
- Aim for 50%+ on Tier 1-2
- Maintain above minimum thresholds

## Testing Strategy

### For Utilities & Pure Functions
```typescript
// Easy to test - high ROI
describe('myUtility', () => {
  it('should handle normal input', () => {
    expect(myUtility(input)).toEqual(expected);
  });
  it('should handle edge cases', () => {
    expect(myUtility(edgeCase)).toEqual(edgeExpected);
  });
});
```

### For API Routes
```typescript
// Test input validation, transformations, and error handling
// Mock database/external services
```

### For React Hooks
```typescript
// Use @testing-library/react hooks utilities
// Test both successful and error scenarios
```

### For Components
```typescript
// Focus on state transitions and event handlers
// Less emphasis on snapshot/presentation testing
```

## Continuous Improvement

### Before Merging PRs
- [ ] Coverage should not decrease for changed files
- [ ] New code should have >70% coverage
- [ ] Critical paths should have >80% coverage

### CI/CD Integration
- Thresholds set in `vitest.config.ts` will fail builds if not met
- Coverage badges auto-generated in `.github/badges/`
- PR comments show coverage changes

## Tools & Commands

### Generate Coverage Report
```bash
yarn test:unit --coverage
```

### Generate Coverage Badges
```bash
yarn coverage:badges
```

### View Detailed Coverage
```bash
# Opens HTML coverage report
open coverage/lcov-report/index.html
```

## Long-term Goals

| Target Date | Goal | Current |
|------------|------|---------|
| Mar 23, 2026 | 15% coverage | 4.63% |
| Apr 23, 2026 | 30% coverage | TBD |
| Jun 23, 2026 | 50% coverage | TBD |
| Dec 23, 2026 | 70% coverage | TBD |

## References

- [Vitest Coverage Documentation](https://vitest.dev/config/#coverage)
- [Testing Best Practices](https://testing-library.com/docs/)
- [Jest Testing Patterns](https://github.com/goldbergyoni/javascript-testing-best-practices)
