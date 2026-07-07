-- One-time migration: remap every Supabase auth.users UUID reference to the
-- corresponding Clerk user id, after scripts/migrate-users-supabase-to-clerk.ts
-- has run and each new Clerk user's externalId == the old Supabase UUID.
--
-- Do NOT run this until:
--   1. scripts/migrate-users-supabase-to-clerk.ts has completed against Clerk
--      (DRY_RUN=false) and its report shows no unexpected errors.
--   2. Clerk's auth cutover (middleware/session code) is deployed, so the app
--      reads auth.userId from Clerk immediately after this migration lands —
--      running this before the cutover, or the cutover before this, leaves a
--      window where profile/gameplay rows don't match the active identity
--      provider's user id.
--
-- This script:
--   - Loads (old_supabase_uuid -> new_clerk_id) pairs from a staging table you
--     populate from the migration report (see load step below).
--   - Folds `user_anomalies` (54 rows in production as of this writing) into
--     `linked_anomalies` with automaton='historical' — the schema previously
--     claimed this had already happened in a past migration; it hadn't (0
--     overlap, 0 existing 'historical' rows verified against production).
--   - Drops every FK constraint on the columns being widened (both the ones
--     pointing at Supabase's auth.users, which are severed for good, and the
--     ones pointing at profiles(id), which get recreated at the end once
--     both sides are text again).
--   - Widens every affected column from `uuid` to `text` (Clerk ids are
--     strings like "user_2abc...", not UUIDs).
--   - Rewrites the values in place, then drops the staging table.
--
-- Run inside a single transaction, and take a fresh backup first — this is
-- not reversible without one.

BEGIN;

-- 1. Staging table for the id mapping. Populate this from the migration
--    report, e.g.:
--      \copy user_id_migration_map (old_supabase_id, new_clerk_id)
--      FROM '/path/to/id-mapping.csv' WITH (FORMAT csv, HEADER true);
--    (Generate that CSV from the migration script's report: filter to
--    status = "created", columns supabaseId,clerkId.)
CREATE TEMP TABLE user_id_migration_map (
  old_supabase_id uuid PRIMARY KEY,
  new_clerk_id    text NOT NULL
);

-- <<< COPY/INSERT your id mapping into user_id_migration_map here >>>

-- 1b. Fold user_anomalies into linked_anomalies (still uuid <-> uuid at this
--     point, so a direct copy is safe), then drop the now-redundant table.
--     Must happen before profiles.id / linked_anomalies.author are widened.
INSERT INTO linked_anomalies (author, anomaly_id, date, automaton)
SELECT user_id, anomaly_id, ownership_date, 'historical'
FROM user_anomalies;

DROP TABLE user_anomalies;

-- 1c. Drop RLS policies keyed off Supabase's auth.uid() against the columns
--     we're widening — auth.uid() never fires correctly again once Clerk owns
--     auth, and the app already accesses these tables via a service-role
--     client (see src/lib/supabase/legacyDataClient.ts), so these are dead
--     policies, not ones we need to recreate against a new identity function.
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can view own mineral inventory" ON user_mineral_inventory;
DROP POLICY IF EXISTS "Users can insert own mineral inventory" ON user_mineral_inventory;
DROP POLICY IF EXISTS "Users can update own mineral inventory" ON user_mineral_inventory;
DROP POLICY IF EXISTS "Users can delete own mineral inventory" ON user_mineral_inventory;
DROP POLICY IF EXISTS "Users can manage their own notification rejections" ON notification_rejections;
DROP POLICY IF EXISTS "authenticated_insert_own_classifications" ON classifications;

-- 1d. Drop every FK on the columns being widened.
--     - profiles_id_fkey / referrals_referree_id_fkey / user_mineral_inventory_user_id_fkey
--       point at auth.users — severed for good (Clerk owns identity now; not
--       recreated below). Supabase's own auth.* internal FKs (oauth_*,
--       identities, sessions, mfa_factors, etc.) are untouched — not ours.
--     - Everything else points at profiles(id) — dropped here, recreated in
--       step 4 once both sides are text again.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referree_id_fkey;
ALTER TABLE user_mineral_inventory DROP CONSTRAINT IF EXISTS user_mineral_inventory_user_id_fkey;

ALTER TABLE classifications DROP CONSTRAINT IF EXISTS classifications_author_fkey;
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_user_fkey;
ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_owner_fkey;
ALTER TABLE "mineralDeposits" DROP CONSTRAINT IF EXISTS mineraldeposits_owner_fkey;
ALTER TABLE researched DROP CONSTRAINT IF EXISTS researched_user_id_fkey;
ALTER TABLE uploads DROP CONSTRAINT IF EXISTS uploads_author_fkey;
ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_fkey;
ALTER TABLE zoo DROP CONSTRAINT IF EXISTS zoo_author_fkey;
ALTER TABLE nps_surveys DROP CONSTRAINT IF EXISTS nps_surveys_user_id_fkey;
ALTER TABLE linked_anomalies DROP CONSTRAINT IF EXISTS linked_anomalies_author_fkey;
ALTER TABLE push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_profile_id_fkey;
ALTER TABLE notification_rejections DROP CONSTRAINT IF EXISTS notification_rejections_profile_id_fkey;
ALTER TABLE routes DROP CONSTRAINT IF EXISTS routes_author_fkey;
ALTER TABLE defensive_probes DROP CONSTRAINT IF EXISTS defensive_probes_user_id_fkey;

-- 2. profiles.id is the primary user identity column everything else
--    hangs off via FK (previously to profiles(id), recreated in step 4).
ALTER TABLE profiles ALTER COLUMN id TYPE text;
UPDATE profiles p
SET id = m.new_clerk_id
FROM user_id_migration_map m
WHERE p.id::text = m.old_supabase_id::text;

-- 3. Every other table with a bare uuid column referencing a user. Each
--    ALTER + UPDATE pair: widen to text, then remap using the staging table,
--    matching on the column's *old* uuid value (cast to text for the join).
ALTER TABLE classifications ALTER COLUMN author TYPE text;
UPDATE classifications t SET author = m.new_clerk_id
FROM user_id_migration_map m WHERE t.author::text = m.old_supabase_id::text;

ALTER TABLE comments ALTER COLUMN author TYPE text;
UPDATE comments t SET author = m.new_clerk_id
FROM user_id_migration_map m WHERE t.author::text = m.old_supabase_id::text;

ALTER TABLE uploads ALTER COLUMN author TYPE text;
UPDATE uploads t SET author = m.new_clerk_id
FROM user_id_migration_map m WHERE t.author::text = m.old_supabase_id::text;

ALTER TABLE votes ALTER COLUMN user_id TYPE text;
UPDATE votes t SET user_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.user_id::text = m.old_supabase_id::text;

ALTER TABLE referrals ALTER COLUMN referree_id TYPE text;
UPDATE referrals t SET referree_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.referree_id::text = m.old_supabase_id::text;

ALTER TABLE researched ALTER COLUMN user_id TYPE text;
UPDATE researched t SET user_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.user_id::text = m.old_supabase_id::text;

-- survey_rewards: skipped — this table does not exist in production
-- (manual/add_survey_rewards_table.sql was apparently never applied there).
-- Not created here since that's a separate decision from this id remap.

ALTER TABLE linked_anomalies ALTER COLUMN author TYPE text;
UPDATE linked_anomalies t SET author = m.new_clerk_id
FROM user_id_migration_map m WHERE t.author::text = m.old_supabase_id::text;

ALTER TABLE inventory ALTER COLUMN owner TYPE text;
UPDATE inventory t SET owner = m.new_clerk_id
FROM user_id_migration_map m WHERE t.owner::text = m.old_supabase_id::text;

ALTER TABLE missions ALTER COLUMN "user" TYPE text;
UPDATE missions t SET "user" = m.new_clerk_id
FROM user_id_migration_map m WHERE t."user"::text = m.old_supabase_id::text;

ALTER TABLE routes ALTER COLUMN author TYPE text;
UPDATE routes t SET author = m.new_clerk_id
FROM user_id_migration_map m WHERE t.author::text = m.old_supabase_id::text;

ALTER TABLE "mineralDeposits" ALTER COLUMN owner TYPE text;
UPDATE "mineralDeposits" t SET owner = m.new_clerk_id
FROM user_id_migration_map m WHERE t.owner::text = m.old_supabase_id::text;

ALTER TABLE user_mineral_inventory ALTER COLUMN user_id TYPE text;
UPDATE user_mineral_inventory t SET user_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.user_id::text = m.old_supabase_id::text;

ALTER TABLE defensive_probes ALTER COLUMN user_id TYPE text;
UPDATE defensive_probes t SET user_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.user_id::text = m.old_supabase_id::text;

ALTER TABLE push_subscriptions ALTER COLUMN profile_id TYPE text;
UPDATE push_subscriptions t SET profile_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.profile_id::text = m.old_supabase_id::text;

ALTER TABLE notification_rejections ALTER COLUMN profile_id TYPE text;
UPDATE notification_rejections t SET profile_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.profile_id::text = m.old_supabase_id::text;

ALTER TABLE nps_surveys ALTER COLUMN user_id TYPE text;
UPDATE nps_surveys t SET user_id = m.new_clerk_id
FROM user_id_migration_map m WHERE t.user_id::text = m.old_supabase_id::text;

-- Deprecated table (Zoo/zoo) — included for completeness, evaluate for removal
-- alongside this migration per the schema's existing @deprecated note.
ALTER TABLE zoo ALTER COLUMN author TYPE text;
UPDATE zoo t SET author = m.new_clerk_id
FROM user_id_migration_map m WHERE t.author::text = m.old_supabase_id::text;
ALTER TABLE zoo ALTER COLUMN owner TYPE text;
UPDATE zoo t SET owner = m.new_clerk_id
FROM user_id_migration_map m WHERE t.owner::text = m.old_supabase_id::text;

-- 4. Recreate the FKs to profiles(id) dropped in step 1d, now that both sides
--    are text again. (auth.users-pointing FKs from step 1d are NOT recreated —
--    those are gone for good.)
ALTER TABLE classifications ADD CONSTRAINT classifications_author_fkey FOREIGN KEY (author) REFERENCES profiles(id);
ALTER TABLE missions ADD CONSTRAINT missions_user_fkey FOREIGN KEY ("user") REFERENCES profiles(id);
ALTER TABLE inventory ADD CONSTRAINT inventory_owner_fkey FOREIGN KEY (owner) REFERENCES profiles(id);
ALTER TABLE "mineralDeposits" ADD CONSTRAINT mineraldeposits_owner_fkey FOREIGN KEY (owner) REFERENCES profiles(id);
ALTER TABLE researched ADD CONSTRAINT researched_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
ALTER TABLE uploads ADD CONSTRAINT uploads_author_fkey FOREIGN KEY (author) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE votes ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);
ALTER TABLE comments ADD CONSTRAINT comments_author_fkey FOREIGN KEY (author) REFERENCES profiles(id);
ALTER TABLE zoo ADD CONSTRAINT zoo_author_fkey FOREIGN KEY (author) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE nps_surveys ADD CONSTRAINT nps_surveys_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE linked_anomalies ADD CONSTRAINT linked_anomalies_author_fkey FOREIGN KEY (author) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE push_subscriptions ADD CONSTRAINT push_subscriptions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notification_rejections ADD CONSTRAINT notification_rejections_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE routes ADD CONSTRAINT routes_author_fkey FOREIGN KEY (author) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE defensive_probes ADD CONSTRAINT defensive_probes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 5. After verifying row counts match expectations, update prisma/schema.prisma
--    to change every `@db.Uuid` on these columns to a plain `String` (no db
--    attribute) to match, then run `prisma db pull`/`prisma generate` to confirm
--    the schema and DB agree before committing.

COMMIT;
