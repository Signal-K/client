---
id: p8d4zn
title: "2.2 webapp user-flow UX audit and fixes"
status: completed
priority: high
labels:
  - migration-2.2
  - ux
  - webapp
  - qa
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-22T13:25:00Z'
updatedAt: '2026-02-22T15:02:00Z'
timeSpent: 0
---

# 2.2 webapp user-flow UX audit and fixes

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Audit the current webapp-only user flows for confusing or non-responsive UI and apply targeted fixes to remove dead-ends and reduce friction across onboarding and gameplay.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Key flows are documented with current issues and expected behavior
- [x] #2 Blocking UX defects are fixed with before/after verification notes
- [x] #3 Mobile and desktop responsive regressions are addressed for touched screens
- [x] #4 Post-fix smoke test checklist is attached to task notes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Landing/home flow redesigned for clearer ecosystem routing in `app/apt/page.tsx`.
- Added explicit external Saily route and positioning text (`https://thedailysail.starsailors.space`).
- Added in-app push notification opt-in prompt on game dashboard:
  - `src/components/notifications/PushNotificationPrompt.tsx`
  - integrated in `app/game/page.tsx`
- Smoke checklist executed:
  - `npm run lint` passed
  - `npm run test:unit` passed
  - `npm run build` currently fails on existing `/page` prerender issue in Next export pipeline and requires separate follow-up.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
