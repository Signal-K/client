-- Create 'bumble' storage bucket for bumblebee images classification
-- This bucket will store images of bumblebees for user classification tasks

-- Insert the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bumble',
  'bumble',
  true,
  52428800, -- 50MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create policy to allow all users to read from bumble bucket
CREATE POLICY "Allow public read access to bumble bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'bumble');

-- Create policy to allow authenticated users to upload to bumble bucket
-- (in case admins need to add new bumblebee images)
CREATE POLICY "Allow authenticated users to upload to bumble bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'bumble');

-- Create policy to allow authenticated users to update objects in bumble bucket
CREATE POLICY "Allow authenticated users to update bumble bucket objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'bumble')
  WITH CHECK (bucket_id = 'bumble');

-- Create policy to allow authenticated users to delete objects in bumble bucket
CREATE POLICY "Allow authenticated users to delete bumble bucket objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'bumble');
