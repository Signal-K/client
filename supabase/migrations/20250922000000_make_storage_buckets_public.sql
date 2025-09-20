-- Make storage buckets public to enable direct URL access without tokens
UPDATE storage.buckets 
SET public = true 
WHERE name IN ('telescope', 'anomalies', 'clouds', 'media', 'zoodex', 'avatars', 'uploads');
