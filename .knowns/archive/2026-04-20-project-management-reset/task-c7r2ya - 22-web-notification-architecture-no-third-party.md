---
id: c7r2ya
title: "2.2 web notification architecture without third-party push provider"
status: completed
priority: high
labels:
  - migration-2.2
  - notifications
  - pwa
  - architecture
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

# 2.2 web notification architecture without third-party push provider

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Design and implement first-party browser notification support for web and PWA users using app-managed subscription state, avoiding external providers like OneSignal/Twilio.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Notification subscription/unsubscription flows exist in-app
- [x] #2 Subscription state is persisted per user/device with consent metadata
- [x] #3 Server endpoint supports sending project/community event notifications
- [x] #4 System degrades safely when push permissions are denied or unsupported
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/migration/two-two-migration
- Added in-app push opt-in/out UI:
  - `src/components/notifications/PushNotificationPrompt.tsx`
  - wired in `app/game/page.tsx`
- Existing authenticated API routes used for persistence:
  - `app/api/gameplay/notifications/subscribe/route.ts`
  - `app/api/gameplay/notifications/reject/route.ts`
- Existing first-party web-push delivery routes/scripts retained:
  - `app/api/notify-my-discoveries/route.ts`
  - `app/api/auto-notify-discoveries/route.ts`
  - `scripts/notify-unclassified-discoveries.js`
- No third-party provider dependency introduced.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/migration/two-two-migration
