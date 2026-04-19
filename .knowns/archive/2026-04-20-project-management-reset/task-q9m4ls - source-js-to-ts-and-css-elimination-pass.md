---
id: q9m4ls
title: "Source JS to TS and CSS elimination pass"
status: completed
priority: high
labels:
  - migration-2.2
  - filesystem
  - typescript
  - styling
specRefs:
  - "specs/migration/two-two-migration"
spec: "specs/migration/two-two-migration"
specPath: ".knowns/docs/specs/migration/two-two-migration.md"
specs:
  - "specs/migration/two-two-migration"
references:
  - "specs/migration/two-two-migration"
  - ".knowns/docs/specs/migration/two-two-migration.md"
createdAt: '2026-02-22T22:35:00Z'
updatedAt: '2026-02-22T22:35:00Z'
timeSpent: 0
---

# Source JS to TS and CSS elimination pass

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Convert authored JavaScript sources to TypeScript, remove non-essential CSS files, and keep the app/test/build pipeline green.
Primary spec: specs/migration/two-two-migration
Primary spec path: .knowns/docs/specs/migration/two-two-migration.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Authored operational scripts are converted from `.js` to `.ts`
- [x] #2 Project builds and tests pass after migration
- [x] #3 Non-essential custom CSS files are removed
- [x] #4 CI workflows invoke TypeScript script entrypoints
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Converted scripts:
  - `scripts/notify-community-event.ts`
  - `scripts/notify-unclassified-discoveries.ts`
  - `scripts/unlock-solarhealth-anomalies.ts`
- Updated invocations:
  - `package.json` `notify:discoveries`
  - `.github/workflows/pipeline.yml` scheduled jobs
- Removed custom CSS file:
  - `src/styles/Anims/StarterStructureAnimations.css`
- Kept one required global stylesheet:
  - `src/styles/globals.css` remains as Tailwind entrypoint (`@tailwind base/components/utilities`).
- Remaining `.js` files are static public worker/runtime artifacts served to browsers:
  - `public/service-worker.js`, `public/sw.js`, `public/workbox-*.js`, `public/fallback-*.js`, `public/assets/Items/sw.js`
- Validation:
  - `yarn lint` passed
  - `yarn test:unit` passed
  - `yarn build` passed
<!-- SECTION:NOTES:END -->

## Spec References

- specs/migration/two-two-migration
