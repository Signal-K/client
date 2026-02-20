---
id: zihdoc
title: "Add posthog session replay"
status: done
priority: high
labels:
  - posthog
  - analytics
  - db
createdAt: '2026-02-19T13:31:11Z'
updatedAt: "2026-02-19T09:58:19Z"
timeSpent: 0
---

# Add posthog session replay

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Session replay is enabled in `src/components/providers/PostHogProvider.tsx`:
- `disable_session_recording: false`
- `session_recording` configuration block present in `posthog.init(...)`.

Provider is wired from root layout (`app/layout.tsx`) with API key/project/region env wiring.
<!-- SECTION:NOTES:END -->
