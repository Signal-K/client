# 🌞 Sunspot Community Mission - Implementation Guide

## Overview

The Sunspot Community Mission is a weekly, community-based event where players collectively observe a G-type star and classify sunspot images to "stabilize" the star and protect their fleet from solar flares.

## Implementation Summary

### Database Schema

#### Tables Created
1. **`solar_events`** - Tracks weekly solar observation events
   - `id` (uuid): Unique identifier
   - `week_start` (date): Start of the week (Sunday)
   - `week_end` (date): End of the week
   - `was_defended` (boolean): Whether the community successfully defended
   - `created_at`, `updated_at` (timestamptz): Tracking timestamps

2. **`defensive_probes`** - Tracks user-launched defensive probes
   - `id` (uuid): Unique identifier
   - `event_id` (uuid): References solar_events
   - `user_id` (uuid): References profiles
   - `count` (integer): Number of probes launched
   - `launched_at` (timestamptz): When probes were launched

#### Database Functions
1. **`get_or_create_current_solar_event()`**
   - Automatically creates a new event if none exists for current week
   - Returns the current week's event

2. **`check_and_update_solar_defense()`**
   - Checks if defense threshold is met
   - Updates `was_defended` flag automatically

3. **`get_solar_event_progress(event_uuid, user_uuid)`**
   - Returns comprehensive progress statistics
   - Includes both community and individual user progress

### Frontend Components

#### Updated Components
1. **`/src/components/tabs/SolarTab.tsx`** (Completely rewritten)
   - Displays current solar event information
   - Shows community progress with real-time countdown
   - Tracks user's individual contributions
   - Allows launching defensive probes (after 5 classifications)
   - Integrates the sunspot classifier

2. **`/app/page.tsx`** (Updated)
   - Solar tab now available to ALL users (not just those with classifications)
   - Positioned prominently after the Updates tab
   - Always visible to encourage community participation

#### New Types
- **`/types/SolarEvents.ts`**
  - `SolarEvent`: Event data structure
  - `DefensiveProbe`: Probe launch records
  - `CommunityProgress`: Progress tracking interface

## Gameplay Flow

### Weekly Cycle
1. **Sunday**: New solar event automatically created
2. **Monday-Saturday**: Users classify sunspots and launch probes
3. **Sunday**: Event ends, defense status determined

### User Experience
1. User opens Solar tab (available immediately)
2. Sees current week's star name (e.g., "Kepler-442")
3. Views community progress bar and statistics
4. Classifies sunspot images
5. After 5 classifications, can launch defensive probe
6. Sees real-time countdown to week's end

### Defense Mechanics
- **Threshold**: 100 combined contributions (classifications + probes)
- **Success**: Fleet operates normally
- **Failure**: 50% delay penalty on all automata next week

## Key Features

### Visual Elements
- 🌞 Sun icon and orange/yellow gradient theme
- ⏱️ Real-time countdown timer
- 📊 Progress bars showing community achievement
- 🛡️ Shield badges for defense status
- 👥 Community statistics display

### User Feedback
- Mission briefing explaining solar activity
- Individual progress tracking
- Probe eligibility indicator (5 classifications required)
- Success/failure status messages

### Integration Points
- Uses existing `classifications` table with `classificationtype = 'sunspot'`
- Integrates `StarterSunspot` component for classification UI
- Leverages Supabase real-time capabilities

## Database Migrations

### Migration Files Created
1. `20251031185020_sunspotEvents.sql` - Creates solar_events table
2. `20251031185023_defensiveProbes.sql` - Creates defensive_probes table
3. `20251031190000_solar_event_functions.sql` - Helper functions
4. `20251031190100_solar_event_rls.sql` - Row Level Security policies

## Security

### Row Level Security (RLS)
- ✅ All users can view solar events
- ✅ Authenticated users can participate
- ✅ Users can only launch their own probes
- ✅ Functions run with SECURITY DEFINER for admin operations

## Future Enhancements

### Recommended Additions
1. **Cron Job**: Automatic weekly event creation via Supabase Edge Functions
2. **Rewards System**: Stardust/badge rewards for participation
3. **Leaderboard**: Top contributors each week
4. **Penalty Implementation**: Actually apply 50% delay to automata
5. **Email Notifications**: Weekly event start/end notifications
6. **Star Variety**: More diverse star names and properties
7. **Dynamic Threshold**: Adjust based on active user count

### Optional Features
- Historical event viewing
- Personal statistics page
- Team/guild collaboration
- Special events with higher rewards
- Narrative story progression

## Testing Checklist

- [ ] New solar event created automatically
- [ ] Community progress updates in real-time
- [ ] Users can classify sunspots
- [ ] Users can launch probes after 5 classifications
- [ ] Progress bar reflects accurate percentages
- [ ] Countdown timer displays correctly
- [ ] Defense status updates when threshold met
- [ ] Solar tab visible to all authenticated users
- [ ] Responsive design works on mobile
- [ ] Database functions execute without errors

## Configuration

### Adjustable Parameters
- **Defense Threshold**: Currently 100 (line 142 in SolarTab.tsx)
- **Probe Requirement**: 5 classifications (line 216 in SolarTab.tsx)
- **Week Start**: Sunday (can be adjusted in date functions)
- **Star Names**: Array of 8 star names (lines 41-50 in SolarTab.tsx)

## Support

For issues or questions:
1. Check Supabase logs for database errors
2. Verify RLS policies are correctly applied
3. Ensure migrations ran successfully
4. Test with multiple users for community features

## Credits

Implementation follows the SSG-294 feature specification for weekly sunspot community missions.
