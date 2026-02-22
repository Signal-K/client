---
id: gyjwvy
title: Gameplay API rollout verification and follow-up list
status: done
priority: medium
labels:
  - dx
  - api
  - tracking
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-19T08:08:09.201Z'
updatedAt: '2026-02-19T09:58:19Z'
timeSpent: 0
---
# Gameplay API rollout verification and follow-up list

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Capture migrated surfaces and remaining direct Supabase client mutations with prioritized next steps.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Knowns notes include migrated surfaces
- [x] #2 Knowns notes include prioritized remaining targets
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
Migrated surfaces (done in current rollout wave):
- Gameplay write mutations now route through authenticated handlers under `app/api/gameplay/*` for deploy, social votes/comments, surveyor comments, anomalies, mineral deposits, inventory use, classification config updates, profile classification points, notifications, extraction, NPS, and zoodex flows.
- Social primary write paths also include server-action backed flows in `src/components/social/actions.ts`.

Prioritized remaining targets from latest audit:
1. Keep server-action mutation files (`src/components/social/actions.ts`, `src/components/profile/setup/actions.ts`) as intentional server-owned write paths.
2. Continue pruning legacy/non-runtime artifacts (`src/utils/README-FastDeploy.md`, `src/components/social/comments/SurveyorForm.tsx.txt`) from mutation audits.
3. Monitor new feature work for regressions back to client-side Supabase writes.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
