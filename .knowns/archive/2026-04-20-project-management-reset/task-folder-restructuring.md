# Task: Feature-First Folder Structure Migration

## Status
**Status:** In Progress
**Priority:** Medium
**Created:** 2026-04-02
**Context:** The project structure is inconsistent, with logic split across `src/components`, `src/app`, and `src/lib`.

## Objectives
- [ ] Consolidate feature-specific logic into `src/features/`.
- [ ] Ensure components, hooks, and types for a feature live together.
- [ ] Reduce top-level directory clutter.

## Strategy
- Follow the established pattern in `src/features/game/`.
- Create `src/features/telescope/`, `src/features/satellite/`, etc.
- Update imports across the codebase using search-and-replace.
