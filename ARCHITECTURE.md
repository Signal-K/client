# Project Architecture Documentation

## File Structure Organization

This project has been reorganized to follow a feature-based architecture pattern for better maintainability and scalability. The new structure separates concerns and groups related functionality together.

## Directory Structure

```
src/
├── core/           # Core application functionality
├── features/       # Feature-specific modules
└── shared/         # Shared utilities and components
```

### Core (`src/core/`)

Contains essential application infrastructure that is used across the entire application:

- **`context/`** - React context providers for global state management
  - `ActivePlanet.tsx` - Active planet state management
  - `InventoryContext.tsx` - Inventory state management
  - `MissionContext.tsx` - Mission state management
  - `TravelContext.tsx` - Travel state management
  - `UserAnomalies.tsx` - User anomalies state
  - `UserProfile.tsx` - User profile state

- **`database/`** - Database layer with Prisma ORM
  - `index.ts` - Database connection and client setup
  - `schema.ts` - Database schema definitions
  - `examples.ts` - Example queries and usage patterns

### Features (`src/features/`)

Feature-specific modules organized by domain functionality:

#### **`missions/`**
- `data.tsx` - Mission-related data and configurations

#### **`planets/`**
- `atmospheric-layers.ts` - Atmospheric layer definitions
- `generators/` - Planet generation utilities
  - `color-picker.tsx` - Color selection for planet generation
  - `fragment-shader.ts` - Fragment shader for planet rendering
  - `vertex-shader.ts` - Vertex shader for planet rendering
- `landmark-types.ts` - Planet landmark type definitions
- `physics.ts` - Planet physics calculations and constants

#### **`research/`**
- `skill-utils.ts` - Research skill management utilities

#### **`structures/`**
- `constants/` - Structure-related constants
  - `Zoodex.tsx` - Zoodex structure definitions
- `utils/` - Structure utilities
  - `Telescope/sector-utils.ts` - Telescope sector calculations

#### **`telescope/`**
- `data/` - Telescope data and projects
- `utils/` - Telescope-specific utilities
  - `sector-utils.ts` - Sector calculation functions

#### **`weather/`**
- `biomes.ts` - Biome data and definitions
- `cloud-compositions.ts` - Cloud composition data
- `cloud-types.ts` - Weather and cloud type definitions

### Shared (`src/shared/`)

Reusable utilities, components, and configurations used across multiple features:

- **`constants/`** - Application-wide constants
  - `backgrounds.ts` - Background configuration constants

- **`data/`** - Shared data structures
  - `projects.tsx` - General project data
  - `rovers.tsx` - Rover list and configurations

- **`helpers/`** - General helper functions
  - `classification-icons.tsx` - Icon classification utilities
  - `nps-popup.tsx` - NPS popup helper
  - `str.helper.ts` - String manipulation helpers

- **`hooks/`** - Reusable React hooks
  - `toast.ts` - Toast notification hook
  - `useDarkMode.ts` - Dark mode toggle hook

- **`utils/`** - General utility functions
  - `generators/` - Generation utilities
    - `P4/vector-calculations.ts` - Vector calculation utilities
    - `PH/` - Planet generation helpers
  - `noise.ts` - Noise generation utilities
  - `utils.ts` - General utility functions (main utilities file)

## Migration from Old Structure

The following directories have been reorganized:

### Moved to `src/core/`:
- `context/` → `src/core/context/`
- `lib/db/` → `src/core/database/`

### Moved to `src/shared/`:
- `lib/utils.ts` → `src/shared/utils.ts`
- `lib/helper/` → `src/shared/helpers/`
- `hooks/` → `src/shared/hooks/`
- `constants/backgrounds.ts` → `src/shared/constants/`
- `data/projects.tsx` → `src/shared/data/`
- `data/roverList.tsx` → `src/shared/data/rovers.tsx`
- `utils/noise.ts` → `src/shared/utils/`
- `utils/Generators/` → `src/shared/utils/generators/`

### Moved to feature directories:
- `data/missions.tsx` → `src/features/missions/data.tsx`
- `utils/planet-physics.ts` → `src/features/planets/physics.ts`
- `data/atmospheric-layers.ts` → `src/features/planets/atmospheric-layers.ts`
- `utils/landmark-types.ts` → `src/features/planets/landmark-types.ts`
- `utils/biome-data.ts` → `src/features/weather/biomes.ts`
- `data/cloud-compositions.ts` → `src/features/weather/cloud-compositions.ts`
- `utils/cloud-types.ts` → `src/features/weather/cloud-types.ts`
- `data/telescope/` → `src/features/telescope/data/`
- `utils/Structures/Telescope/` → `src/features/telescope/utils/`
- `constants/Structures/` → `src/features/structures/constants/`
- `utils/Structures/` → `src/features/structures/utils/`
- `utils/research/` → `src/features/research/`

## Benefits of New Structure

1. **Feature Isolation**: Related functionality is grouped together, making it easier to understand and maintain
2. **Clear Separation of Concerns**: Core, shared, and feature-specific code are clearly separated
3. **Scalability**: New features can be added without cluttering the root directory
4. **Maintainability**: Code is easier to find and modify when grouped by functionality
5. **Reusability**: Shared utilities are clearly identified and can be reused across features
6. **Import Clarity**: Import paths now clearly indicate whether code is core, shared, or feature-specific

## Next Steps

1. ✅ **Update import statements** - All import statements have been updated to reflect new file locations
2. Update any build scripts or configurations that reference old file paths
3. Consider creating index files (`index.ts`) in feature directories for cleaner exports
4. Document any feature-specific APIs or patterns that emerge

## Development Guidelines

- **Core**: Only add files here if they are truly core to the application infrastructure
- **Shared**: Add utilities, hooks, and components that are used by multiple features
- **Features**: Keep feature-specific code isolated within its respective directory
- **Naming**: Use clear, descriptive names for files and directories
- **Exports**: Consider using index files for cleaner imports from feature directories
