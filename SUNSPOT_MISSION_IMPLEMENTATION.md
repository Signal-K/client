# 🌞 Sunspot Community Mission - Updated Implementation

## Overview

The Sunspot Community Mission is a weekly, community-based event where players collectively observe a G-type star and classify sunspot images to protect their fleet from solar flares.

## Key Features (Updated)

### 🎯 Core Mechanics
- **Community Threshold**: 10 total classifications needed (reduced from 100)
- **AEST Timezone**: All countdowns and week boundaries use Australian Eastern Standard Time
- **Classification Cooldown**: 5-minute wait between classifications
- **Probe Deployment**: One probe per hour per user (once threshold met)
- **3D Sun Visualization**: Real-time sunspot display based on community progress

### ⏱️ Time-Based Features
- **Week Cycle**: Sunday to Sunday (AEST)
- **Real-time Countdown**: Minutes/hours remaining until week end
- **Classification Rate Limiting**: Enforced 5-minute cooldown with visual timer
- **Hourly Probe Deployment**: Users can launch one defensive probe every 60 minutes

### 🎨 Visual Components

#### 3D Sun Display
- Renders actual sunspots on 3D solar surface
- Number of sunspots = total community classifications this week
- Animated rotation and pulsing effects
- Star field background with orbit controls
- Overlay showing star name and defense status

#### Probe Deployment Animation
- Shimmer effect on deployment button
- 3-second animation when probe launches
- Visual feedback for successful deployment

### 📊 Classification Workflow

#### Step 1: Click "Count Sunspots" Button
- Disabled if cooldown is active (shows remaining time)
- Opens full-screen classifier interface

#### Step 2: Tutorial Screen (Optional)
- Shows observation date/time (random between week start and now)
- Explains what sunspots are
- Instructions for counting and annotating
- "Start Classification" button to proceed

#### Step 3: Classification Interface
- Displays random sunspot anomaly from database
- Shows observation date/time in header
- Two input fields:
  1. **Sunspot Count** (required number input)
  2. **Shape Description** (optional text input)
- Full-size image display (white background)
- Submit button (disabled until count entered)

#### Step 4: Submission
- Saves to `classifications` table with:
  - `classificationtype`: "sunspot"
  - `content`: Formatted string with count and description
  - `media`: Contains image URL and annotations array
  - `classificationConfiguration`: JSON with sunspot count, description, observation date, annotations
- Returns to main solar tab
- Updates sunspot count on 3D sun

## Database Schema

### Tables
1. **`solar_events`** - Weekly event tracking
   ```sql
   - id (uuid)
   - week_start (date)
   - week_end (date)
   - was_defended (boolean)
   - created_at, updated_at (timestamptz)
   ```

2. **`defensive_probes`** - Probe launch records
   ```sql
   - id (uuid)
   - event_id (uuid → solar_events)
   - user_id (uuid → profiles)
   - count (integer, default 1)
   - launched_at (timestamptz)
   ```

3. **`classifications`** (existing table, used for sunspots)
   ```sql
   - id (bigint)
   - created_at (timestamptz)
   - content (text) - formatted as "Count: X. Shape: Y"
   - author (uuid → profiles)
   - anomaly (bigint → anomalies)
   - media (json) - {imageUrl, annotations: []}
   - classificationtype (text) - "sunspot"
   - classificationConfiguration (jsonb) - {sunspotCount, shapeDescription, observationDate, annotations}
   ```

## Component Structure

### `/src/components/tabs/SolarTab.tsx`
Main component with three sub-sections:

1. **Sun3D** - 3D sun visualization component
2. **SunspotClassifier** - Full-screen classification interface
3. **Main Solar Tab** - Progress tracking and controls

### Key State Management
```typescript
- currentEvent: SolarEvent | null
- communityProgress: CommunityProgress
- lastClassificationTime: Date | null
- canClassify: boolean (based on cooldown)
- probeAnimation: boolean (for deployment effect)
- showClassifier: boolean (toggle between views)
```

## Technical Implementation

### AEST Time Handling
```typescript
function getAESTTime(date: Date = new Date()): Date {
  const aestOffset = 10 * 60; // UTC+10
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utcTime + (aestOffset * 60000));
}
```

### Classification Cooldown
- Queries most recent classification by user
- Calculates time since last classification
- Disables button and shows countdown if < 5 minutes
- Re-checks every 10 seconds

### Probe Deployment Limits
- Checks for existing probe launches in last hour
- Prevents deployment if time elapsed < 60 minutes
- Alert shown to user if attempting too soon

### Random Anomaly Selection
- Fetches all sunspot anomalies from database
- Selects random anomaly for each classification session
- Generates random observation time between week start and now

## UI/UX Features

### Progress Indicators
- **3D Sunspots**: Visual representation of community effort
- **Progress Bar**: Percentage toward 10-classification goal
- **Community Stats**: Total classifications and probes
- **User Stats**: Individual contribution tracking

### Status Badges
- **Defended** (green): Threshold met
- **Countdown** (red): Time remaining with clock icon

### Button States
- **Count Sunspots**: Disabled during cooldown (shows minutes remaining)
- **Deploy Probe**: Only visible when threshold met, disabled during launch
- **Submit Classification**: Disabled until required fields filled

### Animations
- Sun rotation (continuous)
- Sunspot pulsing (varied per sunspot)
- Shimmer effect on probe deployment
- Star field twinkling

## Configuration Parameters

Located at top of `SolarTab.tsx`:
```typescript
const COMMUNITY_THRESHOLD = 10; // Classifications needed
const CLASSIFICATION_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
```

## Database Migrations

1. `20251031185020_sunspotEvents.sql` - solar_events table
2. `20251031185023_defensiveProbes.sql` - defensive_probes table  
3. `20251031190000_solar_event_functions.sql` - Helper functions
4. `20251031190100_solar_event_rls.sql` - Row Level Security

## Styling & Theming

### Color Scheme
- Orange/yellow gradients for solar theme
- Teal (`#78cce2`) for accents and borders
- Black/transparent overlays for readability
- Green for success states

### Tailwind Animation
Added `shimmer` animation to `tailwind.config.ts`:
```typescript
keyframes: {
  shimmer: {
    "0%": { transform: "translateX(-100%)" },
    "100%": { transform: "translateX(100%)" },
  },
},
animation: {
  shimmer: "shimmer 2s infinite",
}
```

## Future Enhancements

### Recommended Additions
1. **Full Annotation Support**: Integrate drawing tools for circling sunspots
2. **Achievement Badges**: Rewards for participation milestones
3. **Leaderboard**: Top contributors each week
4. **Email Notifications**: Weekly event reminders
5. **Penalty Implementation**: Actually apply 50% delay to failed defense
6. **Historical Stats**: Past week performance graphs
7. **Team Collaboration**: Guild-based defense bonuses

### Advanced Features
- Difficulty scaling based on active users
- Special event weeks with bonus rewards
- Machine learning validation of sunspot counts
- Real solar data integration
- Spectral analysis mini-game

## Testing Checklist

- [x] 3D sun renders with correct sunspot count
- [x] AEST countdown displays accurately
- [x] 5-minute cooldown enforces properly
- [x] Random anomaly selection works
- [x] Observation date generates correctly
- [x] Classifications save to database with proper structure
- [x] Probe deployment has 1-hour limit
- [x] Shimmer animation plays on deployment
- [x] Progress bar updates in real-time
- [x] User and community stats display correctly
- [x] Back navigation works from classifier
- [x] Tutorial can be dismissed
- [x] Required fields enforce properly
- [ ] Annotation drawing integration (future)
- [ ] Rewards distribution (future)
- [ ] Penalty application (future)

## Performance Notes

- Sun rendering uses React Three Fiber (optimized)
- Database queries use count() for efficiency
- Classification cooldown checks every 10 seconds (not real-time)
- Time updates every 60 seconds to minimize re-renders
- Images loaded on-demand in classifier

## Troubleshooting

### Common Issues

1. **Cooldown not working**: Check database for classification records
2. **Sun not showing sunspots**: Verify classification count query
3. **AEST time incorrect**: May need adjustment for daylight saving
4. **Probe deployment fails**: Check RLS policies on defensive_probes table
5. **Classifier won't load**: Verify anomaly data exists in database

## Credits

Implementation follows SSG-294 specification with enhanced visual features and improved user experience based on feedback.

---

**Version**: 2.0  
**Last Updated**: November 1, 2025  
**Status**: Production Ready ✅

