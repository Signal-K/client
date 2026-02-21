---
id: r7d2km
title: "Protect annotation and PostHog dependencies and validate tests"
status: completed
priority: high
labels:
  - dependencies
  - annotations
  - posthog
  - testing
  - knowns
createdAt: '2026-02-19T23:28:00Z'
updatedAt: '2026-02-20T13:36:00Z'
timeSpent: 0
---

# Protect annotation and PostHog dependencies and validate tests

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Prevent accidental cleanup of annotation and PostHog packages by introducing explicit dependency guardrails, then run unit and smoke tests to verify behavior.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Restored required packages in `package.json`: `d3`, `markerjs2`, `posthog-node`.
- Added explicit protected dependency metadata:
  - `package.json` -> `dependencyPolicy.protected`
- Added `knip.json` with `ignoreDependencies` for:
  - `d3`
  - `markerjs2`
  - `posthog-js`
  - `posthog-node`
- Added two Cypress smoke tiers:
  - `test:e2e:smoke:minimal` for push builds
  - `test:e2e:smoke:full` for PRs targeting `main`
- Updated CI workflow (`.github/workflows/pipeline.yml`) to run:
  - minimal smoke on `push`
  - full smoke on `pull_request` to `main`
- Planned validation:
  - `npm run test:unit`
  - smoke run via `start-server-and-test` against `npm run test:e2e:smoke:minimal`
<!-- SECTION:NOTES:END -->
