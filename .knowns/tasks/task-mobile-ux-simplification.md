# Task: Streamline "Build" Phase for Mobile UX

## Status
**Status:** Backlog
**Priority:** Medium
**Created:** 2026-04-02
**Context:** The current deployment flow is multi-step and requires significant navigation, which is friction-heavy for mobile users.

## Objectives
- [ ] Implement "One-Tap Deployment" directly from the Hub's `StructureCard`.
- [ ] Create a "Unified Mission Feed" to bypass viewport-specific navigation for active tasks.
- [ ] Simplify touch targets and navigation paths for the core "Build -> Do" loop.

## Strategy
- Add a "Quick Action" button to `StructureCard` when in an "undeployed" state.
- Develop a `GlobalMissionFeed` component that aggregates pending anomalies from all structures.
- Reduce the number of confirmation dialogs for mobile users.
