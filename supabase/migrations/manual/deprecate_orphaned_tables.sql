-- ┌────────────────────────────────────────────────────────────┐
-- │  DEPRECATION NOTICE: orphaned tables                       │
-- │  Date: 2026-02-23                                          │
-- │  Ticket: sdd-a9e2f4 (see .knowns/tasks/)                   │
-- └────────────────────────────────────────────────────────────┘
--
-- Two tables have been identified as orphaned during the 2026-02 schema audit:
--
--   1. unlocked_technologies  — 0 rows, 0 code references
--      Legacy predecessor to `researched`. user_id is INTEGER not UUID,
--      indicating it predates the UUID auth migration. Safe to drop immediately.
--
--   2. user_anomalies         — 54 rows, 0 code references
--      Legacy predecessor to `linked_anomalies`. Has historical ownership data
--      that should be preserved in a backup before dropping.
--
-- This file adds deprecation comments to both tables.
-- The actual DROP statements are intentionally deferred to ticket sdd-a9e2f4
-- after a production backup has been confirmed.
--
-- Also adds GRANTS for the new survey_rewards table created in
-- add_survey_rewards_table.sql.

-- ── 1. Comment the deprecated tables ────────────────────────────────────────

COMMENT ON TABLE "public"."unlocked_technologies" IS
  'DEPRECATED 2026-02-23: superseded by `researched`. '
  'Has 0 rows. user_id is INTEGER (pre-UUID auth era). '
  'Safe to drop — tracked in ticket sdd-a9e2f4.';

COMMENT ON TABLE "public"."user_anomalies" IS
  'DEPRECATED 2026-02-23: superseded by `linked_anomalies`. '
  'Has 54 rows of historical ownership data. '
  'Backup required before drop — tracked in ticket sdd-a9e2f4.';

-- ── 2. Grants for survey_rewards ─────────────────────────────────────────────

-- Anon role: no access (data is user-private)
-- Authenticated role: SELECT own rows via RLS; no direct INSERT (API handles writes)
GRANT SELECT ON TABLE "public"."survey_rewards" TO "authenticated";
GRANT ALL ON TABLE "public"."survey_rewards" TO "service_role";
