---
id: tdi1lj
title: Add link/referrals between client and saily
status: todo
priority: high
labels:
  - refs
  - ecosystem
  - invites
  - saily
  - client
createdAt: '2026-02-18T12:05:53.000Z'
updatedAt: '2026-02-19T10:20:08.542Z'
timeSpent: 0
---
# Add link/referrals between client and saily

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Kickoff audit completed for referral integration points in client:
- Referral submission/read endpoints already exist (`app/api/gameplay/profile/referral-status/route.ts`, `app/api/gameplay/profile/code/route.ts`).
- Referral UI surfaces found in `app/research/page.tsx`, `src/components/profile/setup/Referrals.tsx`, and `src/components/layout/Tes.tsx`.

Remaining blocker for full completion:
- Saily-side referral URL/contract is not yet defined in this repo (no `saily` domain/SDK/config references found). Next step is to add a shared referral-link builder once target URL/query contract is provided.
<!-- SECTION:NOTES:END -->

