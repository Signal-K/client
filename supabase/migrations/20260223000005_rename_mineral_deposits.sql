-- Migration: rename mineralDeposits → mineral_deposits + standardise column names
--
-- mineralDeposits was the only camelCase table name in the schema (naming violation).
-- Column renames: mineralconfiguration → mineral_configuration, roverName → rover_name.
-- PostgreSQL tracks FKs by OID, so the FK in user_mineral_inventory automatically
-- continues to reference the renamed table without needing to be recreated.

-- Rename table
ALTER TABLE "public"."mineralDeposits" RENAME TO mineral_deposits;

-- Rename the identity sequence
ALTER SEQUENCE "public"."mineralDeposits_id_seq" RENAME TO mineral_deposits_id_seq;

-- Standardise camelCase columns to snake_case
ALTER TABLE public.mineral_deposits RENAME COLUMN mineralconfiguration TO mineral_configuration;
ALTER TABLE public.mineral_deposits RENAME COLUMN "roverName" TO rover_name;

-- Rename stale constraint names for hygiene (optional but clean)
ALTER TABLE public.mineral_deposits RENAME CONSTRAINT "mineraldeposits_pkey" TO mineral_deposits_pkey;
ALTER TABLE public.mineral_deposits RENAME CONSTRAINT "mineraldeposits_anomaly_fkey" TO mineral_deposits_anomaly_fkey;
ALTER TABLE public.mineral_deposits RENAME CONSTRAINT "mineraldeposits_discovery_fkey" TO mineral_deposits_discovery_fkey;
ALTER TABLE public.mineral_deposits RENAME CONSTRAINT "mineraldeposits_owner_fkey" TO mineral_deposits_owner_fkey;

-- Grant same permissions to new table name (old grants auto-transfer after rename,
-- but re-granting is defensive best practice)
GRANT ALL ON TABLE public.mineral_deposits TO anon;
GRANT ALL ON TABLE public.mineral_deposits TO authenticated;
GRANT ALL ON TABLE public.mineral_deposits TO service_role;
GRANT ALL ON SEQUENCE public.mineral_deposits_id_seq TO anon;
GRANT ALL ON SEQUENCE public.mineral_deposits_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.mineral_deposits_id_seq TO service_role;
