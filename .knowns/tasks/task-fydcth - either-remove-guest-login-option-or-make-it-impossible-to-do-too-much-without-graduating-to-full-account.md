---
id: fydcth
title: "Either remove guest login option or make it impossible to do too much without \"graduating\" to full account"
status: completed
priority: high
labels:
  - auth
  - profiles
  - data
  - outreach
  - acquisition
  - users
createdAt: '2026-03-06T18:19:07Z'
updatedAt: '2026-03-06T08:51:42Z'
timeSpent: 0
---

# Either remove guest login option or make it impossible to do too much without "graduating" to full account

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Removed anonymous/guest sign-in from the primary auth screen so users must create a full account path (email/social) before entering gameplay.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

- [x] #1 Guest login option is removed from `/auth`
- [x] #2 Auth screen no longer calls `signInAnonymously`
- [x] #3 Project validation passes after auth-path update

## Implementation Notes

- Updated `src/components/profile/auth/EnhancedAuth.tsx`:
  - Removed guest CTA and related temporary-account messaging.
  - Removed anonymous sign-in logic and state (`signInAnonymously` path).
  - Kept standard Supabase auth providers and account creation flow.
- Validation evidence:
  - `yarn lint` passed on March 6, 2026.
  - `npm run test:unit` passed (`126` files, `1046` tests) on March 6, 2026.
  - `yarn build` passed on March 6, 2026.
