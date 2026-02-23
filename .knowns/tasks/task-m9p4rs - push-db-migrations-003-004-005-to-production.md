---
id: m9p4rs
title: "Push migrations 003/004/005 to production via supabase db push"
status: not-started
priority: high
labels:
  - db-migration
  - production
  - schema
  - deployment
createdAt: '2026-02-23T12:00:00Z'
updatedAt: '2026-02-23T12:00:00Z'
timeSpent: 0
---

# Push DB migrations 003/004/005 to production

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Three local migrations were applied and verified during the 2026-02-23 backend streamlining
session. They are confirmed clean locally (all 5 migrations replay via `supabase db reset`,
973 tests pass, build clean). The production database has not yet received these migrations.

### Migrations to push

| File | Purpose | Data impact |
|---|---|---|
| `20260223000003_migrate_user_anomalies.sql` | Migrate 54 `user_anomalies` rows into `linked_anomalies`, then drop table | **54 rows moved to `linked_anomalies`** |
| `20260223000004_drop_empty_legacy_tables.sql` | Drop `unlocked_technologies` + `sectors` | 0 rows dropped (both empty) |
| `20260223000005_rename_mineral_deposits.sql` | Rename `mineralDeposits` → `mineral_deposits`, columns standardised | Non-destructive rename |

### Production data safety

- `user_anomalies` (54 rows): backed up in `supabase_exports/user_anomalies_remote_backup.sql`
- `mineralDeposits` (51 rows): backed up in `supabase_exports/mineralDeposits_remote_backup.sql`
- Migration 003 is FK-guarded with `WHERE EXISTS (SELECT 1 FROM profiles)` and
  `WHERE EXISTS (SELECT 1 FROM anomalies)` — only valid rows migrate
- If a row has no matching profile or anomaly, it is **silently skipped** (not an error;
  orphaned historical data is acceptable to discard)

### Timing consideration

Migration 005 renames the table and columns. The API codebase (already deployed to production
matching branch) was updated in the same session. If the code is deployed before the migration
runs, the API will 500 on `mineral_deposits` queries. **Deploy code and migration atomically,
or ensure the migration runs within the same deployment.**
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `supabase db push --linked` succeeds with all 3 migrations applied
- [ ] #2 Production `mineral_deposits` table exists with columns `mineral_configuration` and `rover_name`
- [ ] #3 Production `linked_anomalies` has the migrated rows (verify count >= 54 reduced by orphan guard)
- [ ] #4 Production tables `user_anomalies`, `unlocked_technologies`, `sectors`, `mineralDeposits` no longer exist
- [ ] #5 Post-push smoke test: `GET /api/gameplay/page-data` returns 200 with mineral deposit data
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
### Push command

```bash
# Credentials from .env
source .env
supabase db push --linked -p "$SUPABASE_DB_PASSWORD"
```

### Post-push verification queries

```sql
-- Confirm rename
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Confirm mineral_deposits column names
SELECT column_name FROM information_schema.columns
WHERE table_name = 'mineral_deposits' AND table_schema = 'public';

-- Check migrated rows
SELECT COUNT(*) FROM linked_anomalies WHERE automaton = 'historical';

-- Confirm dropped tables are gone
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_anomalies', 'unlocked_technologies', 'sectors', 'mineralDeposits');
-- Expected: 0 rows
```

### Rollback note

There is no automated rollback for these migrations (Supabase does not support
down-migrations natively). If a rollback is needed:

1. Restore `user_anomalies` from `supabase_exports/user_anomalies_remote_backup.sql`
2. Restore `mineralDeposits` from `supabase_exports/mineralDeposits_remote_backup.sql`
3. Manually reverse the renames via `ALTER TABLE mineral_deposits RENAME TO "mineralDeposits"` etc.
4. Redeploy previous app code

In practice, rollback is unlikely — the code already runs against the new schema locally.
<!-- SECTION:NOTES:END -->

## Spec References

- `supabase/migrations/20260223000003_migrate_user_anomalies.sql`
- `supabase/migrations/20260223000004_drop_empty_legacy_tables.sql`
- `supabase/migrations/20260223000005_rename_mineral_deposits.sql`
- `supabase_exports/user_anomalies_remote_backup.sql` (54 rows — pre-migration backup)
- `supabase_exports/mineralDeposits_remote_backup.sql` (51 rows — pre-migration backup)
- `task-7a3f1c` (rename mineralDeposits — DONE)
- `task-a9e2f4` (drop deprecated tables — DONE)
- `two-two-survey-audit-and-ops.md` (schema audit changes summary)
