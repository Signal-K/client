---
id: 4k2m8p
title: "Migrate raw SQL queries to Prisma model-based queries"
status: not-started
priority: medium
labels:
  - db-refactor
  - prisma
  - developer-experience
  - sdd
createdAt: '2026-02-23T11:31:00Z'
updatedAt: '2026-02-23T11:31:00Z'
timeSpent: 0
---

# Migrate raw SQL queries to Prisma model-based queries

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The entire codebase currently uses `prisma.$queryRaw` and `prisma.$executeRaw` for 
every database operation. While this works, it bypasses Prisma's type-safe query 
builder and means `prisma/schema.prisma` was effectively a dormant file with just a 
generator/datasource block.

As part of the 2026-02-23 schema audit, `prisma/schema.prisma` was fully populated with
model definitions for all 24 active tables (with deprecated tables included and marked).
Now that models exist, new code should prefer `prisma.model.operation()` over raw SQL.

This ticket covers the migration of existing `$queryRaw` calls to model-based queries,
prioritising the most-called routes first.

**Not a big-bang rewrite** — do file-by-file, deploy and test incrementally.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All `$queryRaw` calls in `research/summary/route.ts` migrated to Prisma model queries
- [ ] #2 All `$queryRaw` calls in `research/unlock/route.ts` migrated to Prisma model queries
- [ ] #3 All `$queryRaw` calls in `gameplay/survey-reward/route.ts` migrated to Prisma model queries
- [ ] #4 `classifications` queries in `page-data/route.ts` migrated
- [ ] #5 `researched` queries (used in 4+ routes) centralised into a shared `lib/server/researched.ts` helper
- [ ] #6 `yarn build` passes; all existing unit tests pass; no regression in API behaviour
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Current state summary

- `prisma/$queryRaw` call count in `src/`: ~45 calls across ~18 route files
- All writes use `prisma.$executeRaw`
- No Prisma model-based queries exist anywhere

### Recommended migration order (by impact)

| Priority | File | Reason |
|----------|------|--------|
| 1 | `research/summary/route.ts` | High-frequency GET; 3 queries → 3 `findMany` calls |
| 2 | `research/unlock/route.ts` | High-impact write; 4 queries + 1 insert |
| 3 | `survey-reward/route.ts` | New file — easy to convert immediately |
| 4 | `gameplay/page-data/route.ts` | 8+ queries; biggest gain |
| 5 | `mineral-deposits/*` | Once `mineralDeposits` table is renamed (ticket 7a3f1c) |

### Example: research/summary route migration

**Before:**
```ts
prisma.$queryRaw<…>`
  SELECT tech_type, created_at FROM researched WHERE user_id = ${userId}
`
```

**After:**
```ts
prisma.researched.findMany({
  where: { userId },
  select: { techType: true, createdAt: true },
})
```

### survey-reward INSERT migration

**Before (raw with ON CONFLICT):**
```ts
prisma.$queryRaw`
  INSERT INTO survey_rewards (user_id, survey_id, ...)
  ON CONFLICT (user_id, survey_id) DO NOTHING
  RETURNING id
`
```

**After (Prisma upsert equivalent):**
```ts
try {
  const row = await prisma.surveyReward.create({ data: { ... } })
  return { granted: true, stardust: 5 }
} catch (e) {
  if (isPrismaUniqueConstraintError(e)) {
    return { granted: false, alreadyGranted: true }
  }
  throw e
}
```

Where `isPrismaUniqueConstraintError` checks `e.code === 'P2002'`.

### Shared helper approach for `researched`

Since `researched` is queried in ~4 routes with similar patterns, extract:

```ts
// src/lib/server/gameplay/researched.ts
export async function getResearchedForUser(userId: string) {
  return prisma.researched.findMany({ where: { userId } })
}

export async function getSurveyBonusForUser(userId: string) {
  const rewards = await prisma.surveyReward.findMany({ where: { userId } })
  return rewards.reduce((sum, r) => sum + r.stardustGranted, 0)
}
```

### Named field mapping

The Prisma models use camelCase fields mapped to DB column names. After migration:
- `tech_type` → `techType`
- `created_at` → `createdAt`  
- `user_id` → `userId`

All existing raw SQL tests and snapshot tests should continue to pass since the 
API response shapes are unchanged.

### SDD Considerations

- Prisma model queries are type-safe at compile time — eliminates the class of
  bugs where column names are misspelled in template literals
- Raw SQL with `$queryRaw<Array<{...}>>` is still valid for complex queries
  (CTEs, window functions, ON CONFLICT) — keep raw for those
- The `$$queryRaw` Prisma methods **do not** run in the same transaction as
  `prisma.model.operation()` by default — use `prisma.$transaction([...])` if 
  atomicity is needed
<!-- SECTION:NOTES:END -->

## Spec References

- `prisma/schema.prisma` (models added in schema audit 2026-02-23)
- `src/app/api/gameplay/research/summary/route.ts`
- `src/app/api/gameplay/research/unlock/route.ts`
- `src/app/api/gameplay/survey-reward/route.ts`
- `src/lib/server/prisma.ts`
