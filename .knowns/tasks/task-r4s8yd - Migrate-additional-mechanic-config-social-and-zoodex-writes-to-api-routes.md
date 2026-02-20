---
id: r4s8yd
title: Migrate additional mechanic config, social, and zoodex writes to API routes
status: done
priority: high
labels:
  - architecture
  - api
  - migration
createdAt: '2026-02-19T11:10:00.000Z'
updatedAt: '2026-02-19T11:14:00.000Z'
timeSpent: 34
---
# Migrate additional mechanic config, social, and zoodex writes to API routes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Continue eliminating direct client-side Supabase mutations for mechanic-critical gameplay paths by moving writes to authenticated API routes while preserving existing UI behavior and Supabase persistence.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Remaining direct social vote/comment writes in core post components use API routes
- [x] #2 Mechanic vote/config update flows use a shared authenticated API route
- [x] #3 Zoodex upload/write path persists via API route and no longer writes tables from client
- [x] #4 Typecheck passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added API routes:
- app/api/gameplay/social/comments/route.ts
- app/api/gameplay/social/votes/route.ts (POST added)
- app/api/gameplay/planet/comments/preferred/route.ts
- app/api/gameplay/skills/unlock/route.ts
- app/api/gameplay/zoodex/entries/route.ts
- app/api/gameplay/classifications/configuration/route.ts

Updated client components to call API routes for writes:
- src/components/social/posts/PostSingle.tsx
- src/components/social/posts/TestPostCard.tsx
- src/components/social/posts/PostWithGen.tsx
- src/components/social/comments/CommentSingle.tsx
- src/components/deployment/missions/structures/Astronomers/PlanetHunters/PlanetType.tsx
- src/components/classification/tools/image-classifier.tsx
- src/components/classification/telescope/blocks/skill-tree/skill-view.tsx
- src/components/deployment/missions/structures/Astronomers/PlanetHunters/PHVote.tsx
- src/components/deployment/missions/structures/Astronomers/DailyMinorPlanet/DMPVote.tsx
- src/components/deployment/missions/structures/Meteorologists/JVH/JVHVote.tsx
- src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CoMVote.tsx
- src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AI4MVote.tsx
- src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/P4Vote.tsx
- src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CloudSignal.tsx
- src/components/discovery/data-sources/Astronomers/PlanetHunters/SettingsPanel.tsx
- src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator.tsx
<!-- SECTION:NOTES:END -->
