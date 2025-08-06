-- Add unlocked column to linked_anomalies table
-- This column tracks whether a satellite anomaly has been unlocked by the user

ALTER TABLE public.linked_anomalies 
ADD COLUMN unlocked boolean DEFAULT NULL;

-- Add unlock_time column for tracking when the unlock occurred
-- This ensures compatibility with any cached frontend code
ALTER TABLE public.linked_anomalies 
ADD COLUMN unlock_time timestamp with time zone DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.linked_anomalies.unlocked IS 'Tracks whether a satellite anomaly has been unlocked by the user. NULL means not applicable, false means locked, true means unlocked.';
COMMENT ON COLUMN public.linked_anomalies.unlock_time IS 'Timestamp when the satellite anomaly was unlocked by the user.';

-- Create index for better query performance when filtering by unlocked status
CREATE INDEX IF NOT EXISTS idx_linked_anomalies_unlocked 
ON public.linked_anomalies (unlocked) 
WHERE unlocked IS NOT NULL;

-- Create composite index for common query patterns (author + automaton + unlocked)
CREATE INDEX IF NOT EXISTS idx_linked_anomalies_author_automaton_unlocked 
ON public.linked_anomalies (author, automaton, unlocked);
