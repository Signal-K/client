-- Comprehensive migration for linked_anomalies satellite unlock functionality
-- This script adds both unlocked and unlock_time columns to handle any cached frontend code

BEGIN;

-- Add unlocked column (boolean for tracking unlock status)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linked_anomalies' 
        AND column_name = 'unlocked'
    ) THEN
        ALTER TABLE public.linked_anomalies 
        ADD COLUMN unlocked boolean DEFAULT NULL;
        
        RAISE NOTICE 'Added unlocked column to linked_anomalies';
    ELSE
        RAISE NOTICE 'unlocked column already exists in linked_anomalies';
    END IF;
END $$;

-- Add unlock_time column (timestamp for when unlock occurred)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linked_anomalies' 
        AND column_name = 'unlock_time'
    ) THEN
        ALTER TABLE public.linked_anomalies 
        ADD COLUMN unlock_time timestamp with time zone DEFAULT NULL;
        
        RAISE NOTICE 'Added unlock_time column to linked_anomalies';
    ELSE
        RAISE NOTICE 'unlock_time column already exists in linked_anomalies';
    END IF;
END $$;

-- Add column comments for documentation
COMMENT ON COLUMN public.linked_anomalies.unlocked IS 'Tracks whether a satellite anomaly has been unlocked by the user. NULL means not applicable, false means locked, true means unlocked.';
COMMENT ON COLUMN public.linked_anomalies.unlock_time IS 'Timestamp when the satellite anomaly was unlocked by the user.';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_linked_anomalies_unlocked 
ON public.linked_anomalies (unlocked) 
WHERE unlocked IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_linked_anomalies_author_automaton_unlocked 
ON public.linked_anomalies (author, automaton, unlocked);

CREATE INDEX IF NOT EXISTS idx_linked_anomalies_unlock_time 
ON public.linked_anomalies (unlock_time) 
WHERE unlock_time IS NOT NULL;

-- Optional: Set default values for existing WeatherSatellite records
-- Uncomment the following lines if you want to set all existing WeatherSatellite records as locked
/*
UPDATE public.linked_anomalies 
SET unlocked = false 
WHERE automaton = 'WeatherSatellite' 
  AND unlocked IS NULL;
*/

COMMIT;

-- Display current schema for verification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'linked_anomalies'
ORDER BY ordinal_position;
