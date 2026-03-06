---
id: r6c3k1
title: "Ecosystem v0 release readiness for Client"
status: completed
priority: high
labels:
  - release
  - v0
  - ux
  - analytics
  - feedback
createdAt: '2026-03-06T00:00:00Z'
updatedAt: '2026-03-06T08:55:25Z'
timeSpent: 0
---

# Ecosystem v0 release readiness for Client

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Prepare the Client web game for first external feedback release in the ecosystem v0 batch. Focus on high-friction UX, critical errors, route/copy consistency, and validated analytics/feedback capture.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Simplify visual/log surfaces in launch-critical screens and remove obvious confusion points.
2. Resolve critical runtime/API issues found in logs and smoke use.
3. Align copy and route flow for launch -> play -> feedback completion.
4. Verify PostHog/feedback capture and confirm data arrives for cohort users.
5. Produce a short release checklist and test script for first feedback cohort.
<!-- SECTION:PLAN:END -->

## Acceptance Criteria
- [x] Critical flow can be completed by a new user without blocker errors.
- [x] Logs are clean enough to identify real regressions.
- [x] Analytics and feedback events are captured for first cohort runs.
- [x] Release checklist exists and is applied to the first deployment.

## Implementation Notes

- Added readiness checklist/report:
  - `.knowns/reports/ecosystem-v0-release-readiness-2026-03-06.md`
- Validation evidence captured in report:
  - `yarn lint` passed
  - `npm run test:unit` passed
  - `yarn build` passed
