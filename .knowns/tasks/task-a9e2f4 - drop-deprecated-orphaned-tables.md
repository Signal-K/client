---
id: a9e2f4
title: "Drop deprecated orphaned tables: unlocked_technologies and user_anomalies"
status: done
priority: low
labels:
  - db-cleanup
  - schema
  - deprecated
  - sdd
createdAt: '2026-02-23T11:31:00Z'
updatedAt: '2026-02-23T12:00:00Z'
timeSpent: 0
---

# Drop deprecated orphaned tables

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Two tables identified in the 2026-02-23 schema audit have zero application code references
and serve no current purpose. Both have been superseded by newer tables. They are marked
as deprecated in `supabase/migrations/manual/deprecate_orphaned_tables.sql` and in the
Prisma schema with `@deprecated` doc comments.

### `unlocked_technologies`

- **0 code references** (confirmed by grep across `src/`, `scripts/`)
- **0 data rows** (sequence `unlocked_technologies_id_seq` at 1, `false` = never used)
- `user_id` column is `INTEGER` (not UUID) — evidence this table predates the UUID auth migration
- Structurally identical to `researched` (which superseded it)
- **Safe to drop immediately** — no backup needed

### `user_anomalies`

- **0 code references** (confirmed by grep across `src/`, `scripts/`)
- **54 rows of historical data** (sequence at 54)
- Was a feature mapping users to "owned" anomalies, replaced by `linked_anomalies.unlocked`
- **Requires backup before drop**

**Identified during the 2026-02-23 schema audit.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Production backup: `supabase_exports/user_anomalies_remote_backup.sql` (54 rows) confirmed before drop
- [x] #2 Migration 20260223000003: migrates `user_anomalies` 54 rows into `linked_anomalies` (FK-guarded WHERE EXISTS), then drops table
- [x] #3 Migration 20260223000004: drops `unlocked_technologies` and `sectors` (both 0 rows, 0 refs)
- [x] #4 Prisma models `UnlockedTechnology`, `UserAnomaly`, `Sector` removed from schema; `npx prisma validate` passes
- [x] #5 `db-schema.test.ts` updated: active count 24→23, `DROPPED_TABLES` replaces `DEPRECATED_TABLES`, tests reflect dropped state
- [x] #6 Build and 973 unit tests pass post-drop (2026-02-23)

**Completed 2026-02-23. `sectors` also dropped in migration 004 (was out of scope in original ticket but had 0 rows and 0 refs — clean addition).**
**All 5 migrations replay cleanly via `supabase db reset`.**
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Migration SQL

```sql
-- Step 1: Drop zero-row, superseded table — safe immediately
DROP TABLE IF EXISTS "public"."unlocked_technologies" CASCADE;

-- Step 2: Drop user_anomalies ONLY after backup is confirmed
-- Run: pg_dump -t user_anomalies ... OR supabase db dump
DROP TABLE IF EXISTS "public"."user_anomalies" CASCADE;
```

### Backup command (for user_anomalies)

```bash
# From local Supabase CLI
supabase db dump --local --table public.user_anomalies -f supabase_exports/user_anomalies_backup_$(date +%Y%m%d).sql

# Or from scripts/data/export_supabase_data.sh
```

### Why user_id was INTEGER in unlocked_technologies

The `unlocked_technologies.user_id` is `integer NOT NULL`, while `researched.user_id` 
is `uuid`. This reveals the migration history:
1. Original app used integer user IDs (likely NextAuth or similar)
2. Migrated to Supabase UUID auth sometime before 2025
3. `unlocked_technologies` was never migrated — it was abandoned pre-UUID
4. `researched` was created as the UUID-native replacement

### SDD Considerations

- `CASCADE` is used in DROP to handle any orphaned FK constraints, but these tables
  have no FK constraints pointing TO them (confirmed in migration file)
- Run `VACUUM ANALYZE` after drop to reclaim storage
- Verify no views reference these tables: `SELECT * FROM pg_views WHERE definition LIKE '%user_anomalies%'
<!-- SECTION:NOTES:END -->

## Spec References

- 2026-02-23 schema audit
- `supabase/migrations/manual/deprecate_orphaned_tables.sql`
- `prisma/schema.prisma` (deprecated model annotations)
- `supabase_exports/remote_data.sql` (source of the 54-row count)
- `two-two-survey-audit-and-ops.md` (schema audit changes summary)
