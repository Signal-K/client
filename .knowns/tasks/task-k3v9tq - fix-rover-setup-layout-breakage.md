---
id: k3v9tq
title: "Fix rover setup layout breakage"
status: completed
priority: high
labels:
  - setup
  - rover
  - ui
  - layout
  - knowns
specRefs:
  - "specs/mechanics/onboarding-spec"
spec: "specs/mechanics/onboarding-spec"
specPath: ".knowns/docs/specs/mechanics/onboarding-spec.md"
specs:
  - "specs/mechanics/onboarding-spec"
references:
  - "specs/mechanics/onboarding-spec"
  - ".knowns/docs/specs/mechanics/onboarding-spec.md"
createdAt: '2026-02-20T00:00:00Z'
updatedAt: '2026-02-20T13:36:00Z'
timeSpent: 0
---

# Fix rover setup layout breakage

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The rover setup page shows only a partial scene background and leaves a large uncovered area below the viewport. The setup surface should fill the available viewport area under the navbar.
Primary spec: specs/mechanics/onboarding-spec
Primary spec path: .knowns/docs/specs/mechanics/onboarding-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Spec reference: specs/mechanics/onboarding-spec
- Ensured tutorial wrappers preserve full-height layout during overlay and normal render paths:
  - `src/components/onboarding/TutorialWrapper.tsx`
- Updated setup shell sizing to use dynamic viewport height:
  - `app/setup/rover/page.tsx`
- Confirmed rover setup section keeps full-height container behavior:
  - `src/components/scenes/deploy/Rover/RoverSection.tsx`
<!-- SECTION:NOTES:END -->


## Spec References

- specs/mechanics/onboarding-spec
