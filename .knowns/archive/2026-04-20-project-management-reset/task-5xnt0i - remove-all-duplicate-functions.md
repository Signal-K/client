---
id: 5xnt0i
title: "Remove all duplicate functions"
status: done
priority: medium
labels:
  - dx
  - code
  - speed
specRefs:
  - "specs/mechanics/classification-spec"
spec: "specs/mechanics/classification-spec"
specPath: ".knowns/docs/specs/mechanics/classification-spec.md"
specs:
  - "specs/mechanics/classification-spec"
references:
  - "specs/mechanics/classification-spec"
  - ".knowns/docs/specs/mechanics/classification-spec.md"
createdAt: '2026-02-19T16:42:12Z'
updatedAt: '2026-02-19T09:58:19Z'
timeSpent: 0
---

# Remove all duplicate functions

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
All functions, mechanics, components that are duplicated, or where there is functionality that is extremely closely replicated; that can be removed without harming tests, please remove it
Primary spec: specs/mechanics/classification-spec
Primary spec path: .knowns/docs/specs/mechanics/classification-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/classification-spec
Initial duplicate-removal pass completed for mission vote flows. Extracted repeated vote mutation logic into `src/lib/gameplay/classification-vote.ts` and rewired:
- `src/components/deployment/missions/structures/Astronomers/PlanetHunters/PHVote.tsx`
- `src/components/deployment/missions/structures/Astronomers/DailyMinorPlanet/DMPVote.tsx`
- `src/components/deployment/missions/structures/Meteorologists/JVH/JVHVote.tsx`
- `src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CoMVote.tsx`
- `src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AI4MVote.tsx`
- `src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/P4Vote.tsx`

Validation: `npx tsc --noEmit` passes.

Second duplicate-removal pass:
- Added shared classification configuration client helper `src/lib/gameplay/classification-configuration.ts`.
- Updated vote helper (`src/lib/gameplay/classification-vote.ts`) to use the shared configuration helper.
- Replaced duplicated merge POST logic in:
  - `src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CloudSignal.tsx`
  - `src/components/discovery/data-sources/Astronomers/PlanetHunters/SettingsPanel.tsx`
  - `src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator.tsx`
  - `src/components/social/comments/CommentSingle.tsx`

Third duplicate-removal pass:
- Added shared classification list loader `src/lib/gameplay/classification-list.ts`.
- Removed repeated classification fetch/transform logic in:
  - `src/components/deployment/missions/structures/Astronomers/DailyMinorPlanet/DMPVote.tsx`
  - `src/components/deployment/missions/structures/Meteorologists/JVH/JVHVote.tsx`
  - `src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CoMVote.tsx`
  - `src/components/deployment/missions/structures/Astronomers/SatellitePhotos/AI4M/AI4MVote.tsx`
  - `src/components/deployment/missions/structures/Astronomers/SatellitePhotos/P4/P4Vote.tsx`

Validation after all duplicate-removal passes: `npx tsc --noEmit` passes.
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/classification-spec
