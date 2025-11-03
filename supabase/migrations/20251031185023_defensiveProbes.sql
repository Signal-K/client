-- Create the defensive_probes table
CREATE TABLE public.defensive_probes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.solar_events (id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE,
  count integer DEFAULT 1 CHECK (count >= 1),
  launched_at timestamp with time zone DEFAULT now()
);

-- Add indexes to improve lookup performance
CREATE INDEX idx_defensive_probes_event_id ON public.defensive_probes (event_id);
CREATE INDEX idx_defensive_probes_user_id ON public.defensive_probes (user_id);