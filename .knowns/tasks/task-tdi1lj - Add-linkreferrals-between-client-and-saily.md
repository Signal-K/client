---
id: tdi1lj
title: Add link/referrals between client and saily
status: completed
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
createdAt: '2026-02-18T12:05:53.000Z'
updatedAt: '2026-03-06T08:55:25Z'
timeSpent: 0
---
# Add link/referrals between client and saily

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
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

Implementation updates (March 6, 2026):
- Added shared referral-link contract utility:
  - `src/features/referrals/referral-links.ts`
  - `buildClientReferralUrl(referralCode)`
  - `buildSailyReferralUrl(referralCode)` (uses `NEXT_PUBLIC_SAILY_URL` fallback to `https://thedailysail.starsailors.space`)
  - `buildReferralShareText(referralCode)`
- Wired referral-link utility into active referral surfaces:
  - `src/features/game/components/ReferralBoostCard.tsx`
  - `src/components/profile/setup/Referrals.tsx`
- Added explicit `Open in Saily` action on both referral surfaces so referral codes can be carried across client and Saily from the same user flow.
- Validation:
  - `yarn lint` passed
  - `npm run test:unit` passed
  - `yarn build` passed
<!-- SECTION:NOTES:END -->



## Spec References

- specs/migration/two-two-migration
