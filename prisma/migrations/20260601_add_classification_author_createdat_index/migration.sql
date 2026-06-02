-- Add composite index on classifications(author, created_at DESC)
-- Speeds up getRecentClassificationsForUser which filters by author and orders by createdAt DESC

CREATE INDEX CONCURRENTLY IF NOT EXISTS "classifications_author_created_at_idx"
ON "classifications" ("author", "created_at" DESC);
