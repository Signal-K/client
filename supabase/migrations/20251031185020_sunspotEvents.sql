-- Create or replace the trigger function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the solar_events table
CREATE TABLE public.solar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL,
  week_end date NOT NULL,
  was_defended boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Automatically update updated_at on changes
CREATE TRIGGER update_solar_events_updated_at
BEFORE UPDATE ON public.solar_events
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Optional: create index for date lookup
CREATE INDEX idx_solar_events_week_start ON public.solar_events (week_start);