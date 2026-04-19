# Task: Restore Planet Painter Functionality

## Status
**Status:** Deferred
**Priority:** Low
**Created:** 2026-04-02
**Context:** Removed during a simplification sweep to improve performance and focus on core gameplay.

## Background
The "Planet Painter" was a complex 3D component used at the end of the Planet Hunters mission for specific anomalies. It allowed users to visualize and configure planets based on classification data.

## What Was Removed
- `src/app/planets/paint/[id]/page.tsx`: The main page for the planet painter.
- `src/app/planets/[id]/page.tsx`: Planet detail page that used the generator.
- `src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator.tsx`: The core generator component.
- `src/components/discovery/data-sources/Astronomers/PlanetHunters/planetViewer.tsx`: The 3D viewer using `@react-three/fiber`.
- `src/components/discovery/data-sources/Astronomers/PlanetHunters/planet.tsx`: The 3D planet mesh and shaders.
- `src/components/discovery/data-sources/Astronomers/PlanetHunters/SettingsPanel.tsx`: UI for adjusting planet parameters.
- `src/components/discovery/planets/physics.ts`: Physics and mineral logic for planets.
- Shaders in `src/shared/utils/generators/PH/`.

## Why It Was Removed
- **High Complexity:** Involved thousands of lines of code and heavy 3D dependencies.
- **Low Usage:** It was an "end-game" mechanic that few users reached.
- **Performance:** Caused potential slowdowns on mobile devices due to WebGL and complex shaders.
- **User Experience:** The component was not well-designed and felt disconnected from the core loop.

## Restoration Requirements
1. **Redesign:** The UI needs to be more intuitive and better integrated into the main game flow.
2. **Performance:** Optimize the 3D rendering for mobile devices.
3. **Connectivity:** Ensure it clearly links back to the citizen science data that "paints" the planet.
4. **Simplification:** Reduce the number of controls and focus on the visual reward of "discovering" a planet.
