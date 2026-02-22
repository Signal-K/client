---
id: tdi1lj
title: "Add link/referrals between client and saily"
status: in-progress
priority: high
labels:
  - refs
  - ecosystem
  - invites
  - saily
  - client
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-18T12:05:53Z'
updatedAt: '2026-02-19T09:58:19Z'
timeSpent: 0
---

# Add link/referrals between client and saily

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
Kickoff audit completed for referral integration points in client:
- Referral submission/read endpoints already exist (`app/api/gameplay/profile/referral-status/route.ts`, `app/api/gameplay/profile/code/route.ts`).
- Referral UI surfaces found in `app/research/page.tsx`, `src/components/profile/setup/Referrals.tsx`, and `src/components/layout/Tes.tsx`.

Remaining blocker for full completion:
- Saily-side referral URL/contract is not yet defined in this repo (no `saily` domain/SDK/config references found). Next step is to add a shared referral-link builder once target URL/query contract is provided.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
