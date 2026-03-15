---
id: task-30-p7-prisma-stats
title: "3.0 Phase 7: Prisma-Backed Live Stats"
status: todo
priority: medium
phase: "3.0-p7"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-15T00:00:00Z'
---

# 3.0 Phase 7: Prisma-Backed Live Stats

## Goal
Replace hardcoded stats ("11+ projects", "3 structures") with real Prisma-backed numbers. Focus on Active Sailors (last 24h) as the primary social proof stat.

## Tasks
- [ ] Add `getActiveSailors()` server function: count users with a classification in last 24h
- [ ] Add `getTotalDiscoveries()` server function: count all classifications
- [ ] `ActiveSailorsCount` Server Component: fetches + renders with revalidation every 5 min
  - `export const revalidate = 300`
  - Animated number with CSS counter animation on mount
- [ ] Replace hardcoded stat blocks in `/apt` with dynamic versions
- [ ] Add `getActiveProjects()` count (projects with classifications in last 7d)

## Schema Check
- Verify `classifications` table has `createdAt` and `userId` — should already exist
- If not, check equivalent table (may be `anomaly` or `observation`)

## Acceptance Criteria
- Stats update without deploy
- No loading spinner — use static fallback value until hydrated
- Revalidation set to 5 minutes
