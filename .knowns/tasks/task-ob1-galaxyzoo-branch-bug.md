---
id: task-ob1-galaxyzoo-branch-bug
title: "Onboarding: Fix GalaxyZoo showTutorial branch renders same component"
status: open
priority: high
createdAt: '2026-04-07T00:00:00Z'
---

# Onboarding: Fix GalaxyZoo showTutorial branch renders same component

## Status
**Status:** Open
**Priority:** High
**Created:** 2026-04-07

## Context
`TelescopeGalaxyZoo` (default export in `src/components/projects/Telescopes/GalaxyZoo.tsx`) has
a `showTutorial` boolean toggled by a "View Tutorial / Return to Task" button. Both branches of
the conditional render `<GalaxyZooTutorial>` — the tutorial is never dismissed and the
classification form is never shown as the standalone view.

```tsx
// line 247–251 — both branches identical
{showTutorial ? (
  <GalaxyZooTutorial anomalyId={anomaly.id} avatarUrl={anomaly.avatarUrl} />
) : (
  <GalaxyZooTutorial anomalyId={anomaly.id} avatarUrl={anomaly.avatarUrl} />
)}
```

## Objectives
- [ ] Replace the `showTutorial ? X : Y` with a proper split:
  - `showTutorial === true` → render only `<GalaxyZooTutorial>` (tutorial flow)
  - `showTutorial === false` → render the classification form directly (skip tutorial, go straight to classify)
- [ ] The "View Tutorial" button should toggle back to the tutorial; "Return to Task" should show just the form

## Strategy
- The classification form is already embedded inside `GalaxyZooTutorial` (shows after `handleTutorialComplete` sets `showClassification=true`)
- Simplest fix: keep the tutorial-gated flow as default; the "Return to Task" path should render a
  standalone classification panel (duplicate the form section, not the whole tutorial component)
- Alternatively: extract the classification form into its own component and compose both paths from it
