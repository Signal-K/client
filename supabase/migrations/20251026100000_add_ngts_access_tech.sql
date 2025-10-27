-- Migration: Add NGTS Access tech type support
-- This enables users to unlock Planet Hunters: Next Generation
-- which provides access to NGTS (Next-Generation Transit Survey) data

-- No schema changes needed - the researched table already supports any tech_type
-- This migration serves as documentation for the new tech type: 'ngtsAccess'

-- Example of how this tech will be recorded:
-- INSERT INTO researched (user_id, tech_type) VALUES (user_id, 'ngtsAccess');

-- Requirements to unlock:
-- - User must have made 4 or more planet classifications
-- - User must have 2 stardust available
-- - Tech type: 'ngtsAccess' must not already be researched

COMMENT ON TABLE researched IS 'Stores user research progress including equipment upgrades (probereceptors, satellitecount, roverwaypoints), data unlocks (spectroscopy, ngtsAccess), and mining tech (findMinerals, p4Minerals, roverExtraction, satelliteExtraction)';
