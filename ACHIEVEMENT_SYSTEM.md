# Achievement System Implementation

## Overview
A comprehensive achievement/badge system that tracks user progress across three main categories:
1. **Classification Achievements** - Track classifications by type (16 different types)
2. **Mineral Deposit Achievements** - Track mineral discoveries
3. **Planet Completion Achievements** - Track fully completed planets

## Components Created

### 1. AchievementBadge Component
**Location:** `/src/components/discovery/achievements/AchievementBadge.tsx`

SVG-based badge component that displays:
- Custom icon for achievement type
- Current count
- Unlock status (locked/unlocked)
- Milestone tier (1, 5, 10, 25)
- Color coding by tier:
  - Bronze (#cd7f32) - 1st achievement
  - Silver (#c0c0c0) - 5th achievement  
  - Gold (#ffd700) - 10th achievement
  - Platinum (#b9f2ff) - 25th achievement

**Props:**
```typescript
interface AchievementBadgeProps {
  icon: React.ReactNode;
  count: number;
  label: string;
  isUnlocked: boolean;
  milestone?: 1 | 5 | 10 | 25;
  size?: "sm" | "md" | "lg";
}
```

### 2. Achievement Types
**Location:** `/src/types/achievement.ts`

Defines TypeScript interfaces for:
- `ClassificationType` - All 16 classification types
- `MilestoneTier` - Achievement tiers (1, 5, 10, 25)
- `ClassificationAchievement` - Progress per classification type
- `MineralDepositAchievement` - Mineral discovery progress
- `PlanetCompletionAchievement` - Planet completion progress
- `AchievementProgress` - Complete achievement state

**Classification Types Supported:**
- planet
- cloud
- telescope-minorPlanet
- sunspot
- roverImg
- zoodex-burrowingOwl
- automaton-aiForMars
- satellite-planetFour
- lidar-jovianVortexHunter
- balloon-marsCloudShapes
- DiskDetective
- superwasp-variable
- telescope-awa
- lightcurve
- marsCloud
- active-asteroid

### 3. useAchievements Hook
**Location:** `/src/hooks/useAchievements.ts`

Fetches and calculates achievement progress:
1. Queries all user classifications and counts by type
2. Counts mineral deposits owned by user
3. Counts completed planets using planet completion logic:
   - Checks planet type (Gaseous/Terrestrial/Habitable)
   - Verifies clouds or mineral deposits found
   - For habitable planets, checks for water discovery
4. Calculates milestone unlock status for each achievement
5. Returns total unlocked vs total available achievements

**Returns:**
```typescript
{
  achievements: AchievementProgress | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

### 4. AchievementsModal Component
**Location:** `/src/components/discovery/achievements/AchievementsModal.tsx`

Full-screen modal displaying all achievements:
- **Header:** Shows total unlocked count (e.g., "24/192 Unlocked")
- **Classification Section:** Shows only the highest unlocked badge per classification type
- **Mineral Deposits Section:** Shows only the highest unlocked milestone
- **Planet Completions Section:** Shows only the highest unlocked milestone

Features:
- **Badge Progression:** Users see their highest achievement (e.g., 5th replaces 1st)
- **No Locked Badges:** Only unlocked achievements are displayed
- Empty state messages when no achievements are unlocked in a section
- Responsive grid layout (2-5 columns based on screen size)
- Icons from lucide-react matching each classification type
- Scrollable content area
- Close button
- High z-index (9999) to appear above all content

### 5. ActivityHeaderSection Integration
**Location:** `/src/components/social/activity/ActivityHeaderSection.tsx`

Added:
- Trophy button at top-right to open achievements modal
- Modal state management
- Gradient button styling matching app theme

## Database Queries

The achievement system queries:
1. **classifications** table - Count by `classificationtype` and `author`
2. **mineralDeposits** table - Count by `owner`
3. **anomalies** table - Planet data (density, temperature)
4. Complex planet completion logic checking:
   - Cloud classifications per anomaly
   - Mineral deposits per anomaly
   - Water-type minerals in deposits

## Milestone Tiers

All achievements use the same 4-tier system:
- **Tier 1:** First achievement (Bronze badge)
- **Tier 5:** Fifth achievement (Silver badge)
- **Tier 10:** Tenth achievement (Gold badge)
- **Tier 25:** Twenty-fifth achievement (Platinum badge)

## Visual Design

Colors:
- Primary accent: #5fcbc3 (cyan)
- Secondary: #2c4f64 (blue-gray)
- Dark: #1e2a3a
- Badge fills: Tier-specific (bronze/silver/gold/platinum)

Icons:
- Telescope for planet discoveries
- Cloud for cloud classifications
- Rocket for minor planets
- Droplets for mineral deposits
- Target for completed planets
- (and 11 more type-specific icons)

## Usage

Users can:
1. Click "Achievements" button in ActivityHeaderSection
2. View all unlocked and locked achievements
3. See progress counts for each achievement type
4. Track milestone progression (1st, 5th, 10th, 25th)
5. See which achievements are still locked

## Future Enhancements

Potential additions:
- Achievement notifications when unlocked
- Share achievement badges on social posts
- Rare/special achievements for specific accomplishments
- Seasonal or event-based achievements
- Leaderboard integration
