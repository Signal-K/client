-- Add 'vote_type' field to support upvote/downvote system
ALTER TABLE public.votes
ADD COLUMN vote_type text CHECK (vote_type IN ('up', 'down')) DEFAULT 'up';

