---
id: y8l2mb
title: 'Migrate layout/header/nav auth-helper usage to SSR/browser auth utils'
status: done
priority: high
labels:
  - architecture
  - auth
  - ssr
createdAt: '2026-02-19T09:32:00.000Z'
updatedAt: '2026-02-19T10:12:00.000Z'
timeSpent: 45
---
# Migrate layout/header/nav auth-helper usage to SSR/browser auth utils

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reduce dependency on @supabase/auth-helpers-react in shared layout/header/nav surfaces by using browser auth utilities and server API routes for data reads.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Browser auth utility/hook added outside auth-helpers-react
- [x] #2 Shared alerts data moved to authenticated API route
- [x] #3 Main header and game navbar migrated off useSession/useSupabaseClient hooks
- [x] #4 Remaining nav/profile-auth helper usages audited and migrated
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Added lib/supabase/browser.ts and src/hooks/useAuthUser.ts. Added auth utility routes app/api/auth/me/route.ts and app/api/auth/logout/route.ts. Added app/api/gameplay/alerts/route.ts and app/api/gameplay/profile/code/route.ts. Updated src/components/layout/Header/MainHeader.tsx, src/components/layout/Tes.tsx, src/components/layout/Navigation/AlertsDropdown.tsx, and src/components/profile/auth/AnonymousUserPrompt.tsx to remove useSession/useSupabaseClient from auth-helpers-react in those surfaces.

Extended migration: updated src/components/layout/Navigation/MissionDropdown.tsx to use server API progress aggregation via app/api/gameplay/milestones/weekly-progress/route.ts. Updated auth surfaces src/components/profile/auth/LoginModal.tsx, src/components/profile/auth/EnhancedAuth.tsx, and src/components/profile/auth/ConvertAnonymousAccount.tsx to use browser Supabase auth utilities rather than auth-helper hooks. Updated top-level routing pages app/page.tsx and app/game/page.tsx to use useAuthUser instead of useSession/useSessionContext.

Additional modernization in auth-gate and deploy entry pages: app/auth/page.tsx, app/auth/register/page.tsx, app/activity/deploy/page.tsx, app/viewports/satellite/deploy/page.tsx, app/activity/deploy/roover/page.tsx, src/components/game/GameHeader.tsx, and src/components/layout/Navbar.tsx now use useAuthUser/browser client patterns instead of auth-helper hooks.

Completed full import-level migration in app/src: replaced all remaining @supabase/auth-helpers-react usages with local browser auth compatibility module at src/lib/auth/session-context.tsx. Updated layout providers (src/components/layout/RootLayoutClient.tsx, app/layouts/activity/activity-layout.tsx) to remove auth-helpers-nextjs createPagesBrowserClient usage and rely on local SessionContextProvider + useAuthUser patterns.
<!-- SECTION:NOTES:END -->
