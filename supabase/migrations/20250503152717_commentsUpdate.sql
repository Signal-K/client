-- Add new columns if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='value') THEN
    ALTER TABLE public.comments ADD COLUMN value text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='category') THEN
    ALTER TABLE public.comments ADD COLUMN category text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='surveyor') THEN
    ALTER TABLE public.comments ADD COLUMN surveyor boolean;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='confirmed') THEN
    ALTER TABLE public.comments ADD COLUMN confirmed boolean;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='configuration') THEN
    ALTER TABLE public.comments ADD COLUMN configuration jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='uploads') THEN
    ALTER TABLE public.comments ADD COLUMN uploads bigint;
  END IF;
END
$$;

-- Add foreign key constraints if not already present
DO $$
BEGIN
  -- Uploads FK
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_uploads_fkey'
  ) THEN
    ALTER TABLE public.comments 
    ADD CONSTRAINT comments_uploads_fkey FOREIGN KEY (uploads) REFERENCES uploads (id);
  END IF;

  -- Parent comment FK
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_parent_comment_fkey'
  ) THEN
    ALTER TABLE public.comments 
    ADD CONSTRAINT comments_parent_comment_fkey FOREIGN KEY (parent_comment_id) REFERENCES comments (id);
  END IF;
END
$$;