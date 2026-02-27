---
id: fv3m1q
title: "2.2 referral system hardening and promotion"
status: in_progress
priority: high
labels:
  - migration-2.2
  - referrals
  - growth
  - ecosystem
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
references:
  - ".knowns/tasks/task-tdi1lj - Add-linkreferrals-between-client-and-saily.md"
createdAt: '2026-02-26T18:25:00Z'
updatedAt: '2026-02-26T22:58:00Z'
timeSpent: 0
---

# 2.2 referral system hardening and promotion

## Description

Improve referral trust and conversion by preventing invalid submissions, surfacing clear error states, and making referrals prominent in the `/game` user loop.

## Acceptance Criteria

- [x] #1 Users cannot submit self-referrals
- [x] #2 Users cannot submit multiple referral codes
- [x] #3 Invalid referral codes return actionable errors
- [x] #4 Referral code and share controls are shown in gameplay dashboard

## Implementation Notes

- Coordinates with existing blocked cross-project referral task `tdi1lj`.
- Current pass targets web client referral UX and backend validation integrity.
- Implemented in `src/components/profile/setup/actions.ts`:
  - Self-referral guard
  - Existing referral guard (single-use per referree)
  - Referrer existence validation
  - Profile-exists prerequisite validation
  - Canonical referral-code persistence (normalized to profile-owned code value)
- Added `src/features/game/components/ReferralBoostCard.tsx` and mounted on `/game` dashboard.
- Refreshed `src/components/profile/setup/Referrals.tsx` for clearer share/copy and stronger visual emphasis.
- Added referral continuity flow:
  - `?ref=` captured on `/auth` and persisted to `pending_referral_code`.
  - Referral fields in profile completion and research pages auto-prefill from pending code.
  - Pending code is cleared after successful referral submission/profile completion.
- Added referral mission activation prompt to `/game` for users without an applied referral:
  - local dismiss persistence (`referral_mission_prompt_dismissed_v1`)
  - CTA to `/referrals`
  - one-click invite-link copy
  - PostHog events:
    - `referral_mission_prompt_shown`
    - `referral_mission_prompt_dismissed`
    - `referral_mission_open_clicked`
    - `referral_mission_copy_clicked`
- Added recruiter milestone progress system shared across referral surfaces:
  - `src/features/referrals/referral-progress.ts`
  - Tier tracking + next-goal progress bar
  - Mounted in:
    - `src/features/game/components/ReferralBoostCard.tsx`
    - `src/components/profile/setup/Referrals.tsx`
- Added unit coverage for referral progression model:
  - `tests/unit/features/referrals/referral-progress.test.ts`
- Added dedicated referral route for stronger growth emphasis:
  - `src/app/referrals/page.tsx` (`MainHeader` + world shell + referral summary + referral panel)
- Rewired referral entry points to the dedicated route:
  - `MainHeader` Invite Crew button
  - `MainHeader` Referral Program menu item
  - `/game` referral mission prompt open action
  - `/leaderboards` referral CTA
- Validation:
  - `yarn lint` passes
  - `npm run test:unit` passes (`126` files, `1032` tests)
