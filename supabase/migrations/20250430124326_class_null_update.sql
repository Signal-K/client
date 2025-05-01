-- Ensure 'id' column is explicitly NOT NULL (optional, as primary key already enforces it)
ALTER TABLE public.classifications
  ALTER COLUMN id SET NOT NULL;
