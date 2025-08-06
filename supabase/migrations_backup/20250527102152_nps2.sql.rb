CREATE TABLE public.nps_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  nps_score integer NOT NULL,
  why text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

