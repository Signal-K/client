---
id: v4sw7k
title: 'Remove deprecated auth-helper packages and migrate middleware/hooks'
status: done
priority: high
labels:
  - architecture
  - auth
  - dependencies
specRefs:
  - "specs/mechanics/profile-spec"
spec: "specs/mechanics/profile-spec"
specPath: ".knowns/docs/specs/mechanics/profile-spec.md"
specs:
  - "specs/mechanics/profile-spec"
references:
  - "specs/mechanics/profile-spec"
  - ".knowns/docs/specs/mechanics/profile-spec.md"
createdAt: '2026-02-19T10:20:00.000Z'
updatedAt: '2026-02-19T10:20:00.000Z'
timeSpent: 10
---
# Remove deprecated auth-helper packages and migrate middleware/hooks

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Finalize auth modernization by removing direct auth-helper package usage from runtime code, migrating middleware to @supabase/ssr, and cleaning direct dependency references.
Primary spec: specs/mechanics/profile-spec
Primary spec path: .knowns/docs/specs/mechanics/profile-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 No runtime imports remain for auth-helpers packages
- [x] #2 middleware.ts migrated to @supabase/ssr
- [x] #3 Root hooks/tests updated to local auth compatibility module
- [x] #4 Deprecated auth-helper packages removed from package.json
- [x] #5 TypeScript passes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/profile-spec
Updated hooks/usePageData.ts and hooks/useNPSManagement.ts imports to local auth compatibility module, updated tests/unit/hooks/useNPSManagement.test.ts mocks, and rewrote middleware.ts to use @supabase/ssr createServerClient cookie handling. Removed direct package.json dependencies on @supabase/auth-helpers-nextjs and @supabase/auth-helpers-react via npm uninstall. Type-check passes after changes.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/profile-spec
