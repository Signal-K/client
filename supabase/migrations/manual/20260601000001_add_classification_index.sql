-- Add composite index to optimize recent classifications query for users
-- This speeds up the getRecentClassificationsForUser query in src/lib/server/game-page-data.ts
CREATE INDEX IF NOT EXISTS idx_classification_author_created_at 
ON public."Classification" (author, "createdAt" DESC);
