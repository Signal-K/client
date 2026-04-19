# Task: Refactor "God Components" (NextScene, ResearchPanel)

## Status
**Status:** In Progress
**Priority:** High
**Created:** 2026-04-02
**Context:** Components like `NextScene.tsx` and `CompactResearchPanel.tsx` have grown to 600-700+ lines, making them hard to maintain and prone to regressions.

## Objectives
- [ ] Decompose `NextScene.tsx` into smaller, mission-specific "ResultCards".
- [ ] Refactor `CompactResearchPanel.tsx` to use a data-driven approach for upgrades.
- [ ] Reduce line counts and improve modularity.

## Strategy
- Extract mission-specific logic into dedicated components in `src/components/projects/(classifications)/results/`.
- Create a centralized `upgrades-config.ts` for the research panel.
- Use a registry pattern to load result components based on classification type.
