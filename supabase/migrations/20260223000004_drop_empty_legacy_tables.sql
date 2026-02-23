-- Migration: drop confirmed-empty legacy tables
--
-- unlocked_technologies: 0 rows in production, superseded by `researched`.
--   user_id is INTEGER (pre-UUID era), structurally incompatible with auth.users.
-- sectors: 0 rows in production, no backend references, no active FK dependents.

DROP TABLE IF EXISTS public.unlocked_technologies;
DROP SEQUENCE IF EXISTS public.unlocked_technologies_id_seq;

DROP TABLE IF EXISTS public.sectors;
DROP SEQUENCE IF EXISTS public.sectors_id_seq;
