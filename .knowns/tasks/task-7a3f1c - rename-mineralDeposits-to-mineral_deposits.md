---
id: 7a3f1c
title: "Rename mineralDeposits table to mineral_deposits (snake_case standardisation)"
status: done
priority: medium
labels:
  - db-cleanup
  - naming-convention
  - schema
  - sdd
createdAt: '2026-02-23T11:31:00Z'
updatedAt: '2026-02-23T12:00:00Z'
timeSpent: 0
---

# Rename mineralDeposits table to mineral_deposits

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The `mineralDeposits` table violates the project-wide snake_case naming convention
used by every other table in the schema. It was named before the convention was established.

All other tables use snake_case: `linked_anomalies`, `user_mineral_inventory`,
`push_anomaly_log`, etc. Only `mineralDeposits` and a small number of legacy columns
(see notes) break this pattern.

This rename is a **pure cosmetic migration** — no column changes, no RLS changes,
no functional impact — but it requires coordinated updates across all raw-SQL queries
in the codebase that reference `"mineralDeposits"` by name.

**Identified during the 2026-02-23 schema audit.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Supabase migration renames `mineralDeposits` → `mineral_deposits` via `ALTER TABLE ... RENAME TO` (20260223000005)
- [x] #2 All raw SQL in `src/` is updated to use `mineral_deposits` — 6 API routes updated, columns standardised to snake_case (`mineral_configuration`, `rover_name`)
- [x] #3 Prisma model `MineralDeposit` `@@map` updated to `mineral_deposits`; column mappings updated
- [x] #4 `db-schema.test.ts` updated: key renamed, column list corrected, old assertion inverted
- [x] #5 Build and 973 unit tests pass post-migration (2026-02-23)

**Completed 2026-02-23. Also renamed columns `mineralconfiguration` → `mineral_configuration` and `roverName` → `rover_name` in the same migration (scope expanded beyond table-only rename).**
**FK from `user_mineral_inventory` survived rename via PostgreSQL OID tracking — no FK recreation needed.**
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Files requiring SQL query updates

Grep: `grep -rn '"mineralDeposits"' src/`

Known files:
- `src/app/api/gameplay/achievements/route.ts` — lines 35, 101
- `src/app/api/gameplay/mineral-deposits/bulk/route.ts` — lines 31, 33
- `src/app/api/gameplay/mineral-deposits/route.ts` — lines 24, 33, 84
- `src/app/api/gameplay/milestones/progress/route.ts` — line 42
- `src/app/api/gameplay/page-data/route.ts` — line 241
- `src/app/api/gameplay/extraction/[id]/route.ts` — lines 21, 57, 85

### Migration SQL template

```sql
-- Run in a transaction; both local and prod must be migrated together
BEGIN;
ALTER TABLE "public"."mineralDeposits" RENAME TO "mineral_deposits";
COMMIT;
```

### Other camelCase column names (lower priority, separate ticket)

Several columns within tables also use mixed casing:
- `anomalies.ticId`, `anomalies.temperatureEq`, `anomalies.parentAnomaly`, `anomalies.anomalyConfiguration`
- `classifications.classificationConfiguration`
- `inventory.parentItem`
- `profiles.activemission`, `profiles.classificationPoints`
- `routes.routeConfiguration`
- `mineralDeposits.roverName`, `mineralDeposits.mineralconfiguration`

These are tracked as future cleanup but are not in scope for this ticket — table-level
rename is the highest priority for code readability.

### SDD Considerations

- **No data loss risk**: `RENAME TO` is an in-place metadata change, no data copied
- **Zero-downtime**: Because we're using raw SQL with string literals, not an ORM
  mapping, the app will break between migration and code deployment. Use a maintenance
  window or feature-flag the queries.
- **RLS policies are automatically renamed** by PostgreSQL when the table is renamed
- **Sequences and indexes** are NOT automatically renamed — may want to add:
  ```sql
  ALTER SEQUENCE "mineralDeposits_id_seq" RENAME TO "mineral_deposits_id_seq";
  ```
<!-- SECTION:NOTES:END -->

## Spec References

- 2026-02-23 schema audit (`.knowns/tasks/`)
- `two-two-survey-audit-and-ops.md` (schema audit changes summary)
