-- Create the "votes" table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for unique votes
CREATE UNIQUE INDEX idx_unique_votes ON votes (post_id, user_id);