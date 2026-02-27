-- Migration: deprecation notices on orphaned tables
-- Created: 2026-02-23
-- Purpose: Document the two tables identified as orphaned in the 2026-02-23
--          schema audit. The actual DROP statements are deferred to ticket
--          sdd-a9e2f4 (requires production backup for user_anomalies).

-- unlocked_technologies: 0 rows, 0 code refs. integer user_id = pre-UUID era.
COMMENT ON TABLE "public"."unlocked_technologies" IS
  'DEPRECATED 2026-02-23: superseded by `researched`. '
  'Has 0 rows. user_id is INTEGER (pre-UUID auth era). '
  'Safe to drop — tracked in ticket sdd-a9e2f4.';

-- user_anomalies: 54 rows, 0 code refs. Superseded by linked_anomalies.unlocked.
COMMENT ON TABLE "public"."user_anomalies" IS
  'DEPRECATED 2026-02-23: superseded by `linked_anomalies`. '
  'Has 54 rows of historical ownership data. '
  'Backup required before drop — tracked in ticket sdd-a9e2f4.';
