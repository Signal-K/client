# Task: Data Fetching & Caching Optimization

## Status
**Status:** Backlog
**Priority:** High
**Created:** 2026-04-02
**Context:** Many components use manual `useEffect` + `fetch` patterns, leading to redundant code and sub-optimal performance on mobile.

## Objectives
- [ ] Integrate a modern data-fetching library (e.g., SWR or TanStack Query).
- [ ] Consolidate fragmented API calls into "Aggregated Summary" endpoints.
- [ ] Implement robust error handling and loading states globally.

## Strategy
- Identify a suitable library (SWR is already in use in some parts of the ecosystem, but let's check `package.json`).
- Refactor `GameClient.tsx` and major tabs to use hooks for data fetching.
- Work with backend/API routes to create `/api/gameplay/summary` endpoints.
