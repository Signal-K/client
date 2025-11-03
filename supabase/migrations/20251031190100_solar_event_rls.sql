-- Enable Row Level Security on solar_events
ALTER TABLE public.solar_events ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on defensive_probes
ALTER TABLE public.defensive_probes ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view solar events
CREATE POLICY "Anyone can view solar events"
  ON public.solar_events
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert solar events (typically through functions)
CREATE POLICY "Authenticated users can create solar events"
  ON public.solar_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can update solar events
CREATE POLICY "Authenticated users can update solar events"
  ON public.solar_events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Everyone can view defensive probes
CREATE POLICY "Anyone can view defensive probes"
  ON public.defensive_probes
  FOR SELECT
  USING (true);

-- Policy: Users can insert their own probes
CREATE POLICY "Users can launch their own probes"
  ON public.defensive_probes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own probes
CREATE POLICY "Users can view their own probes"
  ON public.defensive_probes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
