-- Migration: Alter anomalies table to match updated definition

-- Add new columns to anomalies
ALTER TABLE public.anomalies
  ADD COLUMN "ticId" text,
  ADD COLUMN type text,
  ADD COLUMN radius double precision,
  ADD COLUMN mass double precision,
  ADD COLUMN density double precision,
  ADD COLUMN gravity double precision,
  ADD COLUMN "temperatureEq" double precision,
  ADD COLUMN temperature double precision,
  ADD COLUMN smaxis double precision,
  ADD COLUMN orbital_period double precision,
  ADD COLUMN lightkurve text;

-- Add foreign key constraint (if not already present)
ALTER TABLE public.anomalies
  ADD CONSTRAINT anomalies_parentAnomaly_fkey FOREIGN KEY ("parentAnomaly") REFERENCES public.anomalies(id);
