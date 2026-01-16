# Star Sailors: Complete User Flow & Citizen Science Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & User Onboarding](#authentication--user-onboarding)
3. [Core Game Economy](#core-game-economy)
4. [Deployment System - Complete Technical Flow](#deployment-system---complete-technical-flow)
5. [Classification Workflows](#classification-workflows)
6. [Research & Upgrade System](#research--upgrade-system)
7. [Mineral Deposit System](#mineral-deposit-system)
8. [Inventory & Resource Management](#inventory--resource-management)
9. [Social Features](#social-features)
10. [Annotation & Data Interaction](#annotation--data-interaction)
11. [Citizen Science Projects](#citizen-science-projects)
12. [Complete User Journey Examples](#complete-user-journey-examples)
13. [Technical Database Schema](#technical-database-schema)

## Overview

Star Sailors is a Next.js 14 gamified citizen science platform where users deploy virtual astronomical structures, classify real scientific data, and contribute to research. The application transforms data analysis into an exploration game with progression mechanics, resource discovery, and community collaboration.

### Recent Additions & Review Summary

This document was reviewed and updated to explicitly call out recently added projects, features, and system improvements. Below is a concise summary of notable additions and changes covered in this review:

- **Mineral Deposit System (expanded):** Full orchestration clarified including research checks, planetary compatibility checks, deposit-roll logic, mineral selection functions, and database insertion flow. Extraction prerequisites and deposit metadata handling are documented.
- **Extraction Minigames:** Extraction flow (rover and satellite) and yield calculation added, with state changes for deposit extraction and UI behavior described.
- **Fast Deploy & Onboarding:** Fast deploy mechanics reaffirmed for anonymous users and effects on unlock timings documented.
- **Research Tree Enhancements:** New and emphasized techs: `spectroscopy`, `findMinerals`, `p4Minerals`, `ngtsAccess`, `roverExtraction`, and `satelliteExtraction` with costs and deployment effects.
- **Rover / AI4M Improvements:** Rover waypoint assignment, mineral waypoint logic, route storage schema, and AI4M terrain mineral selection and probability clarified.
- **Satellite Unlock Schedule & Modes:** Weather, Planetary Survey, and Wind Survey modes clarified along with unlock timing and satellite-specific unlock mechanics.
- **Sunspot & Continuous Participation:** Sunspot participation mechanics and unlock/expiration windows documented.
- **Inventory & UI Updates:** Mineral deposit cards, filters, extraction gating, and inventory interactions described.
- **Social Features & Community Bonuses:** Activity feed, comment/vote-based bonus deploys, leaderboards, and community recognition flows emphasized.
- **Annotation & Media Export:** Annotation tool improvements and PNG export behavior covered.

If you'd like, I can (a) expand any of the bullets into a new detailed subsection, (b) run a link/anchor consistency pass across the file, or (c) create a changelog section listing exact commit references for each feature.

### Core Mechanics
- **Classification**: Analyze real astronomical/planetary data to earn points
- **Deployment**: Deploy telescopes, satellites, and rovers to unlock new data
- **Progression**: Research upgrades to enhance capabilities and unlock features
- **Resources**: Discover and extract mineral deposits from classified data
- **Social**: Collaborate, validate, and learn from the community
- **Economy**: Stardust points fuel research and unlocks

### Application Structure
Component organization follows user mechanics rather than technical implementation:
- `/src/components/classification/` - Data classification interfaces
- `/src/components/deployment/` - Structure deployment and management
- `/src/components/research/` - Skill trees and upgrade systems
- `/src/components/social/` - Community features and interaction
- `/src/components/profile/` - User management and authentication

## Authentication & User Onboarding

### Anonymous Account Flow (Quick Start)
**Path**: `/auth` → Anonymous signup

1. **Landing Page**: User visits the auth page and sees:
   - "Quick Start" option for anonymous accounts
   - Traditional email/Google signup options
   - Information about benefits of permanent accounts

2. **Anonymous Registration**: 
   - User clicks "Continue as Guest"
   - System creates temporary anonymous account via Supabase Auth
   - User immediately gains access to all features
   - Progress is saved temporarily

3. **Fast Deploy Benefit**:
   - **Technical**: System checks `classifications` table count for user
   - **Condition**: If count = 0, user gets fast deploy status
   - **Effect**: All deployments use `date = now - 24 hours` instead of `now`
   - **Result**: Linked anomalies unlock immediately instead of waiting
   - **Code**: `/src/utils/fastDeploy.ts` - `getDeploymentDate()`

4. **Account Conversion (Optional)**:
   - At any time, users can convert to permanent account
   - **Convert Anonymous Account Component** prompts users
   - Benefits shown: multi-device access, email updates, leaderboards, permanent progress
   - Email verification process initiated via Supabase Auth
   - Anonymous session merged with new permanent account

### Traditional Account Flow
**Path**: `/auth` → Email/Google signup

1. **Registration Options**:
   - Email + password registration
   - Google OAuth integration
   - Account creation via Supabase Auth
   - Automatic profile row creation in `profiles` table

2. **Profile Setup**:
   - Username and basic details collection
   - Avatar selection/generation
   - Initial tutorial trigger

3. **Onboarding**:
   - First login redirects to main dashboard (`/`)
   - No pre-deployed structures (user must manually deploy)
   - Tutorial system guides through deployment and classification
   - **No fast deploy** - must wait for unlock timers

## Core Game Economy

### Stardust Points System
**Earning Stardust**:
- **Base Calculation**: 1 stardust = 1 classification
- **All classification types** count equally
- **No decay or expiration** - points are permanent
- **Query**: `SELECT COUNT(*) FROM classifications WHERE author = userId`

**Spending Stardust**:
- **Quantity Upgrades**: 10 stardust each
  - Telescope receptors (+1 receptor, max 2 total)
  - Satellite count (+1 satellite, max 2 total) 
  - Rover waypoints (+2 waypoints, max 6 total)
- **Data/Measurement Upgrades**: 2 stardust each
  - Spectroscopy (stellar metallicity measurements)
  - Find Minerals (AI4M mineral detection)
  - P4 Minerals (Planet Four ice detection)
  - Rover Extraction (physical mineral harvesting)
  - Satellite Extraction (remote mineral analysis)
  - NGTS Access (additional exoplanet data)

**Available Balance**:
```typescript
const basePoints = totalClassifications
const researchPenalty = researched.reduce((total, r) => {
  const isQuantity = ['probereceptors', 'satellitecount', 'roverwaypoints'].includes(r.tech_type)
  return total + (isQuantity ? 10 : 2)
}, 0)
const availableStardust = basePoints - researchPenalty
```

### Fast Deploy Mechanic
**Purpose**: New user retention - immediate gratification

**Activation**:
- User has ZERO classifications
- Checked before every deployment
- Automatically disabled after first classification

**Implementation**:
```typescript
// Check status
const { count } = await supabase
  .from('classifications')
  .select('id', { count: 'exact', head: true })
  .eq('author', userId)
const isFastDeploy = (count || 0) === 0

// Apply to deployment
const deploymentDate = isFastDeploy 
  ? new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
  : new Date() // Now
```

**Effect on Structures**:
- **Telescope**: All anomalies immediately available (no wait)
- **Satellite**: All cloud/data unlocked instantly
- **Rover**: All waypoints accessible immediately
- **Sunspots**: All observations ready to classify

**UI Indicators**:
- Green welcome badge: "🎁 Welcome Gift Active!"
- Message: "Your tools will be ready in seconds!"
- Displayed prominently in deployment interfaces

## Deployment System - Complete Technical Flow

### Universal Deployment Mechanics

**Weekly Cycle**:
- Deployments reset every **Sunday 00:01 AEST** (Saturday 14:01 UTC)
- Previous week's deployments remain accessible for classification
- New deployments overwrite previous week's data

**Database Table**: `linked_anomalies`
```sql
CREATE TABLE linked_anomalies (
  id SERIAL PRIMARY KEY,
  author UUID REFERENCES profiles(id),
  anomaly_id INTEGER REFERENCES anomalies(id),
  classification_id INTEGER REFERENCES classifications(id), -- Optional link
  automaton TEXT, -- 'Telescope', 'WeatherSatellite', 'Rover', 'TelescopeSolar'
  date TIMESTAMP WITH TIME ZONE,
  unlocked BOOLEAN DEFAULT NULL, -- NULL=not applicable, false=locked, true=unlocked
  unlock_time TIMESTAMP WITH TIME ZONE
)
```

**Deployment Check Algorithm**:
```typescript
async function checkDeployment(automaton: string) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  const { data } = await supabase
    .from('linked_anomalies')
    .select('*')
    .eq('automaton', automaton)
    .eq('author', userId)
    .gte('date', oneWeekAgo.toISOString())
  
  return {
    canDeploy: data.length === 0,
    deploymentCount: data.length
  }
}
```

### Telescope Deployment

**Path**: `/activity/deploy` or main dashboard deploy button

**Prerequisites**:
- Authenticated user (anonymous or permanent)
- No telescope deployment in past 7 days

**Community Bonus Deployments**:
- Base: 1 deployment per week
- Bonus: +1 for every 3 votes on others' classifications
- Bonus: +1 for each comment on others' classifications
- Checked: Only within past 7 days
- Effect: Can deploy again if `totalAllowed > linkedCount`

**Deployment Process**:

1. **Sector Selection**:
   - Star field viewport with D-pad navigation
   - Sectors identified by (x, y) coordinates
   - Visual density overlay shows anomaly concentration
   - Drag functionality for fine-tuned positioning

2. **Anomaly Generation** (`generateAnomaliesForSector()`):
   - **Seeded randomization** based on sector coordinates
   - Deterministic: Same sector = same anomalies
   - **Base allocation**: 4 anomalies per deployment
   - **With upgrade**: 6 anomalies (probereceptors research)

3. **Anomaly Types**:
   - **70% - TESS Planets**: `anomalySet = 'telescope-tess'`
   - **30% - Minor Planets**: `anomalySet = 'telescope-minorPlanet'`
   - **Unlock Active Asteroids**: After 2+ asteroid classifications
     - Adds `anomalySet = 'telescope-asteroid-active'` to pool

4. **Database Insertion**:
```typescript
const deploymentDate = await getDeploymentDate(supabase, userId)
const rows = selectedAnomalies.map(anomaly => ({
  author: userId,
  anomaly_id: anomaly.id,
  automaton: 'Telescope',
  date: deploymentDate.date,
  unlocked: null // Telescopes don't use unlock mechanic
}))
await supabase.from('linked_anomalies').insert(rows)
```

5. **Post-Deployment**:
   - Confirmation modal with sector name
   - Push notification sent about new targets
   - Redirect to `/structures/telescope`

### Satellite Deployment

**Path**: Main dashboard → `/viewports/satellite/deploy`

**Prerequisites**:
- Must have classified at least one planet
- No satellite deployment in past 7 days
- Planet targets fetched from user's planet classifications

**Investigation Modes**:

1. **Weather Analysis** (Default):
   - **Purpose**: Discover cloud formations
   - **Anomaly Sets**:
     - Base: `cloudspottingOnMars`
     - Upgraded: + `lidar-jovianVortexHunter`, `balloon-marsCloudShapes`
   - **Upgrade Condition**: 2+ cloud classifications
   - **Quantity**: 4 anomalies (6 with satellite upgrade)

2. **Planetary Survey**:
   - **Purpose**: Calculate planet statistics (mass, radius, density, temperature)
   - **Target**: User's classified planet
   - **Result**: Stats stored in classification configuration
   - **Unlocks**: Planet type classification, mineral compatibility check

3. **Wind Survey (Planet Four)**:
   - **Purpose**: Track Martian seasonal changes
   - **Anomaly Set**: `satellite-planetFour`
   - **Requirement**: Planet must have known radius
   - **Warning**: Shows if planet incompatible

**Mineral Discovery System**:
- **Visual Indicator**: Shows if planet can discover minerals
- **Requirements**:
  - ✅ Planet has stats (density, radius, mass)
  - ✅ User has cloud classifications on this planet
- **Display**: 
  - Red alert: "💧 Water & Minerals Detected!"
  - Yellow progress: Shows which requirements are met
- **Technical Check**:
```typescript
const hasValidStats = planet.stats && 
  planet.stats.density !== "N/A" &&
  planet.stats.radius !== "N/A" &&
  planet.stats.mass !== "N/A"

const { data: cloudClassifications } = await supabase
  .from('classifications')
  .select('classificationConfiguration')
  .eq('author', userId)
  .eq('classificationtype', 'cloud')

const hasCloudForPlanet = cloudClassifications.some(c => 
  c.classificationConfiguration.parentPlanet === planetClassificationId
)

const canDiscoverMinerals = hasValidStats && hasCloudForPlanet
```

**Deployment Execution**:
```typescript
const planet = selectedPlanet
const { data: classifications } = await supabase
  .from('classifications')
  .select('id')
  .eq('author', userId)
  .eq('anomaly', planet.id)
  .eq('classificationtype', 'planet')

const classificationId = classifications[0]?.id
const deploymentDate = await getDeploymentDate(supabase, userId)

// Fetch anomalies based on mode
const { data: anomalies } = await supabase
  .from('anomalies')
  .select('id')
  .in('anomalySet', selectedAnomaSets)

const rows = anomalies.slice(0, anomalyCount).map(a => ({
  author: userId,
  anomaly_id: a.id,
  classification_id: classificationId,
  automaton: 'WeatherSatellite',
  date: deploymentDate.date,
  unlocked: false, // Satellites use unlock mechanic
  unlock_time: null
}))

await supabase.from('linked_anomalies').insert(rows)
```

**Unlock Schedule**:
- **Without Fast Deploy**: 1 anomaly unlocks per day over 4-6 days
- **With Fast Deploy**: All unlocked immediately
- **Unlock Logic**: Each day, check if any satellites should unlock

### Rover Deployment

**Path**: `/activity/deploy/roover`

**Prerequisites**:
- Must have classified at least one AI4M terrain image
- No rover deployment in past 7 days
- Requires route generation (waypoint planning)

**Deployment Flow**:

1. **Route Generation**:
   - User uses interactive map to place waypoints
   - **Base**: 4 waypoints
   - **Upgraded**: 6 waypoints (roverwaypoints research)
   - Waypoints define rover path through terrain

2. **Anomaly Allocation**:
```typescript
const { data: classified } = await supabase
  .from('classifications')
  .select('anomaly')
  .eq('classificationtype', 'automaton-aiForMars')
  .eq('author', userId)

const classifiedIds = classified.map(c => c.anomaly)

const { data: allAnomalies } = await supabase
  .from('anomalies')
  .select('id')
  .eq('anomalySet', 'automaton-aiForMars')

// Prefer unclassified, but use all if insufficient
let unclassified = allAnomalies.filter(a => !classifiedIds.includes(a.id))
if (unclassified.length < waypoints.length) {
  unclassified = allAnomalies
}

const selectedAnomalies = unclassified.slice(0, waypoints.length)
```

3. **Mineral Waypoint Assignment**:
   - If user has `findMinerals` research:
   - Every 4th waypoint becomes mineral deposit location
   - Stored in route configuration
```typescript
const mineralWaypointIndices = []
if (hasFindMinerals) {
  for (let i = 0; i < waypoints.length; i++) {
    if ((i + 1) % 4 === 0) {
      mineralWaypointIndices.push(i)
    }
  }
}
```

4. **Route Storage**:
```typescript
const routeConfig = {
  anomalies: selectedAnomalies.map(a => a.id),
  waypoints: waypoints.map((wp, i) => ({
    x: wp.x,
    y: wp.y,
    order: i,
    isMineralDeposit: mineralWaypointIndices.includes(i)
  }))
}

await supabase.from('routes').insert({
  author: userId,
  routeConfiguration: routeConfig,
  timestamp: deploymentDate.date
})
```

5. **Linked Anomaly Creation**:
```typescript
for (const anomaly of selectedAnomalies) {
  await supabase.from('linked_anomalies').insert({
    author: userId,
    anomaly_id: anomaly.id,
    automaton: 'Rover',
    date: deploymentDate.date,
    unlocked: true // Rovers don't use timed unlocks
  })
}
```

### Sunspot Participation

**Path**: Main dashboard → Solar Health section

**Mechanics**:
- **Not a deployment** - continuous participation
- **Time Window**: 3 days from participation
- **Unlock Timer**: 1 hour after participation
- **Expiration**: Anomalies expire after 3 days

**Participation Process**:
```typescript
const { data: sunspotAnomalies } = await supabase
  .from('anomalies')
  .select('*')
  .eq('anomalySet', 'sunspot')

for (const anomaly of sunspotAnomalies) {
  await supabase.from('linked_anomalies').insert({
    author: userId,
    anomaly_id: anomaly.id,
    automaton: 'TelescopeSolar',
    unlocked: false,
    date: new Date().toISOString()
  })
}
```

**Unlock Logic**:
```typescript
function isUnlocked(linkedAnomaly) {
  if (typeof linkedAnomaly.unlocked === 'boolean') {
    return linkedAnomaly.unlocked
  }
  const unlockTime = new Date(linkedAnomaly.date)
  unlockTime.setHours(unlockTime.getHours() + 1)
  return new Date() >= unlockTime
}
```

## Classification Workflows

### Universal Classification Pattern

**All classifications follow this flow**:
1. User accesses linked anomaly from deployed structure
2. Classification interface loads with project-specific tools
3. User analyzes data and submits classification
4. **Database insertion**: Row created in `classifications` table
5. **Stardust increment**: Total count increases by 1
6. **Mineral deposit roll**: 1/3 chance if requirements met
7. **UI feedback**: Success message and next anomaly prompt

**Database Structure**:
```sql
CREATE TABLE classifications (
  id SERIAL PRIMARY KEY,
  author UUID REFERENCES profiles(id),
  anomaly INTEGER REFERENCES anomalies(id),
  content TEXT, -- Legacy format: "key:value, key:value"
  classificationConfiguration JSONB, -- Modern format
  media TEXT[], -- Array of uploaded image URLs
  classificationtype TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
```

### Telescope Classification Flow

**Path**: `/structures/telescope` → Project selection → Classification

**Available Projects**:
1. **Planet Hunters TESS**:
   - **Data**: Light curve plots (brightness vs time)
   - **Task**: Identify periodic transits (dips in brightness)
   - **Options**:
     - "Repeating dips" (periodic transits)
     - "Similar size dips" (consistent depth)
     - "Aligned dips" (phase-locked)
     - "No dips" (no detectable transits)
   - **Advanced**: Estimate planet parameters (mass, radius, period)

2. **Planet Hunters NGTS**:
   - **Unlock**: Requires `ngtsAccess` research (2 stardust)
   - **Data**: Higher quality light curves
   - **Purpose**: More challenging planet detection

3. **Daily Minor Planet**:
   - **Data**: Sequential astronomical images (blink comparator)
   - **Task**: Identify objects that move between frames
   - **Method**: Mark moving objects, distinguish from artifacts

4. **Sunspots**:
   - **Data**: Solar imagery
   - **Task**: Count and categorize sunspots
   - **Purpose**: Space weather monitoring

5. **Disk Detective**:
   - **Data**: Multi-wavelength infrared images
   - **Task**: Identify circumstellar disks around stars
   - **Method**: Look for extended emission beyond star

**Classification Process**:
```typescript
async function submitClassification({
  anomalyId,
  classificationtype,
  configuration,
  media = []
}) {
  const { data, error } = await supabase
    .from('classifications')
    .insert({
      author: userId,
      anomaly: anomalyId,
      classificationtype,
      classificationConfiguration: configuration,
      media,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  return { classificationId: data.id, error }
}
```

### Cloud Classification Flow

**Path**: Satellite data → Weather missions

**Cloud Classification Types**:

1. **Cloudspotting on Mars**:
   - **Data**: Mars satellite imagery
   - **Task**: Identify and classify cloud types
   - **Annotation**:
     - Draw boundaries around clouds
     - Classify type: water ice, CO2, dust
   - **Configuration**:
```typescript
{
  clouds: [
    {
      type: 'water-ice',
      coordinates: { x: 150, y: 200 },
      shape: 'wispy',
      confidence: 'high'
    }
  ],
  parentPlanet: classificationId // Links to planet classification
}
```

2. **Jovian Vortex Hunters**:
   - **Data**: Jupiter atmospheric imagery
   - **Task**: Mark cyclonic and anticyclonic vortices
   - **Annotation**:
     - Draw circles around storm features
     - Measure vortex size
     - Track evolution

3. **Mars Cloud Shapes (Balloon)**:
   - **Data**: High-altitude balloon imagery
   - **Task**: Detailed cloud morphology
   - **Purpose**: Fine-grained atmospheric analysis

**Mineral Deposit Trigger**:
After cloud classification submission:
```typescript
async function onCloudClassificationComplete(classificationId) {
  // Fetch most recent classification
  const { data: classification } = await supabase
    .from('classifications')
    .select('*')
    .eq('id', classificationId)
    .single()
  
  // Select mineral type (50/50 chance)
  const mineralConfig = selectCloudMineral() // Returns water-ice or co2-ice
  
  // Attempt deposit creation (1/3 chance if requirements met)
  await attemptMineralDepositCreation({
    supabase,
    userId,
    anomalyId: classification.anomaly,
    classificationId,
    mineralConfig,
    location: `Mars Cloud Formation #${classification.anomaly}`
  })
}
```

### AI for Mars (Terrain Classification)

**Path**: Rover waypoints → AI4M classification

**Purpose**: Train ML models for autonomous rover navigation

**Classification Task**:
- Identify terrain features in rover imagery
- Categories: Sand, Bedrock, Soil, Rock, Float Rock, etc.
- Annotation tools for precise marking

**Configuration Storage**:
```typescript
{
  terrain_types: [
    { type: 'sand', percentage: 45 },
    { type: 'bedrock', percentage: 30 },
    { type: 'soil', percentage: 25 }
  ],
  annotations: [
    { type: 'rock', coordinates: { x: 120, y: 89 }, size: 'medium' }
  ]
}
```

**Mineral Deposit Creation**:
```typescript
// After AI4M classification if user has findMinerals research
const mineralType = selectAI4MMiner() // Returns iron-ore, soil, copper, etc.
await attemptMineralDepositCreation({
  mineralConfig: {
    type: mineralType,
    amount: Math.random() * 80 + 40, // 40-120 units
    purity: Math.random() * 0.3 + 0.6, // 60-90%
    metadata: { source: 'rover-analysis', terrain: dominantTerrainType }
  },
  location: `Rover Waypoint ${waypointIndex}`
})
```

### Planet Four (Seasonal Changes)

**Path**: Satellite P-4 missions

**Purpose**: Track Martian seasonal sublimation events

**Classification Elements**:
- **Fans**: Dark streaks from sublimating ice
- **Blotches**: Larger dark regions
- **Categories**: Mark type, size, direction

**Annotation Example**:
```typescript
{
  features: [
    {
      type: 'fan',
      center: { x: 200, y: 150 },
      direction: 'north-east',
      length: 45,
      spread: 20
    },
    {
      type: 'blotch',
      center: { x: 350, y: 400 },
      diameter: 30
    }
  ],
  season: 'southern-spring',
  confidence: 0.85
}
```

**Mineral Discovery**:
- Detects: Dust, soil, water-vapour
- Probability distribution: 40% dust, 30% soil, 30% water-vapour

## Research & Upgrade System

### Research Tree Structure

**Tech Categories**:
- **Quantity Upgrades** (10 stardust)
- **Data/Measurement Upgrades** (2 stardust)
- **Extraction Upgrades** (2 stardust)

**Database Table**: `researched`
```sql
CREATE TABLE researched (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  tech_type TEXT, -- E.g., 'probereceptors', 'findMinerals'
  tech_id INTEGER, -- Optional: specific inventory item reference
  created_at TIMESTAMP WITH TIME ZONE
)
```

### Complete Upgrade List

#### Quantity Upgrades (10 Stardust Each)

1. **Telescope Receptors** (`probereceptors`):
   - **Effect**: Deploy 6 anomalies instead of 4
   - **Benefit**: More classification opportunities per week
   - **Max**: 1 upgrade (2 total receptors)
   - **Query Check**:
```typescript
const { data } = await supabase
  .from('researched')
  .select('tech_type')
  .eq('user_id', userId)
  .eq('tech_type', 'probereceptors')
const hasUpgrade = (data?.length || 0) > 0
const anomalyCount = hasUpgrade ? 6 : 4
```

2. **Satellite Count** (`satellitecount`):
   - **Effect**: Deploy 6 cloud anomalies instead of 4
   - **Benefit**: More weather/atmospheric data per mission
   - **Max**: 1 upgrade (2 satellites total)
   - **Implementation**: Same pattern as telescope

3. **Rover Waypoints** (`roverwaypoints`):
   - **Effect**: Place 6 waypoints instead of 4
   - **Benefit**: Longer rover routes, more terrain classification
   - **Max**: 1 upgrade (6 waypoints total)
   - **Multiplier**: +2 waypoints per upgrade

#### Data/Measurement Upgrades (2 Stardust Each)

1. **Spectroscopy** (`spectroscopy`):
   - **Effect**: Fetch stellar metallicity from ExoFOP CSV
   - **Display**: Shows [Fe/H] values for planet host stars
   - **Implementation**:
```typescript
if (hasSpectroscopy) {
  const res = await fetch(`/api/exofop?tic=${ticId}`)
  const { result } = await res.json()
  if (result?.metallicity) {
    planetStats.metallicity = result.metallicity
  }
}
```
   - **UI**: Displays with interpretation (metal-rich/poor, star age)

2. **Find Minerals - AI4M** (`findMinerals`):
   - **Effect**: 1/3 chance to discover minerals from rover terrain classifications
   - **Types**: Iron ore, cultivable soil, copper, aluminum
   - **Requirement**: Must be checked before mineral deposit creation
   - **Also Enables**: Mineral waypoint markers on rover routes (every 4th waypoint)

3. **Find Icy Deposits - P4** (`p4Minerals`):
   - **Effect**: 1/3 chance to discover ice from Planet Four classifications
   - **Types**: Water-ice, CO2-ice, dust, soil, water-vapour
   - **Synergy**: Combines with cloudspotting data for accuracy

4. **NGTS Access** (`ngtsAccess`):
   - **Effect**: Unlocks Planet Hunters NGTS project
   - **Benefit**: Higher quality exoplanet data, more challenging classifications

#### Extraction Upgrades (2 Stardust Each)

1. **Rover Extraction** (`roverExtraction`):
   - **Effect**: Enables physical extraction of rover-discovered minerals
   - **Without**: Can only view deposits, prompted to research
   - **With**: Can execute extraction minigame
   - **Check**:
```typescript
const hasRoverExtraction = await hasUpgrade(supabase, userId, 'roverExtraction')
if (!hasRoverExtraction) {
  // Redirect to research page or show upgrade prompt
  router.push('/research')
  return
}
```

2. **Satellite Extraction** (`satelliteExtraction`):
   - **Effect**: Enables remote extraction of satellite-discovered minerals
   - **Types**: Cloud-based water/CO2 ice, atmospheric minerals
   - **Method**: Different extraction minigame (remote sensing)

### Upgrade Purchase Flow

**Path**: `/research` → Research panel → Purchase upgrade

**Process**:
1. **Check Balance**:
```typescript
const { data: allClassifications } = await supabase
  .from('classifications')
  .select('id')
  .eq('author', userId)

const { data: researched } = await supabase
  .from('researched')
  .select('tech_type')
  .eq('user_id', userId)

const basePoints = allClassifications.length
const spent = researched.reduce((total, r) => {
  const isQuantity = ['probereceptors', 'satellitecount', 'roverwaypoints'].includes(r.tech_type)
  return total + (isQuantity ? 10 : 2)
}, 0)
const available = basePoints - spent
```

2. **Validate Purchase**:
   - Check if user has enough stardust
   - Check if upgrade not already purchased
   - Verify upgrade prerequisites (none currently)

3. **Execute Purchase**:
```typescript
async function handleUpgrade(techType: string, cost: number) {
  if (availableStardust < cost) {
    alert('Insufficient stardust')
    return
  }
  
  const { error } = await supabase
    .from('researched')
    .insert({
      user_id: userId,
      tech_type: techType,
      created_at: new Date().toISOString()
    })
  
  if (!error) {
    // Refresh upgrade data
    await fetchUpgradeData()
    // Show success message
    toast.success(`Unlocked: ${techType}`)
  }
}
```

4. **UI Update**:
   - Upgrade card changes to "Unlocked" state
   - Available stardust decreases
   - New capabilities immediately active

### Upgrade Effects in Deployment

**Telescope Deployment with Upgrade**:
```typescript
const { data: upgrade } = await supabase
  .from('researched')
  .select('tech_type')
  .eq('user_id', userId)
  .eq('tech_type', 'probereceptors')

const anomalyCount = upgrade && upgrade.length > 0 ? 6 : 4
const selectedAnomalies = allAnomalies.slice(0, anomalyCount)
```

**Satellite Deployment with Upgrade**:
```typescript
const satelliteCount = await getSatelliteCount(supabase, userId)
// Returns 1 base + number of satellitecount research entries
const anomalyCount = satelliteCount > 1 ? 6 : 4
```

**Rover Deployment with Upgrade**:
```typescript
const { data: roverResearch } = await supabase
  .from('researched')
  .select('tech_type')
  .eq('user_id', userId)
  .eq('tech_type', 'roverwaypoints')

const roverWaypointUpgrades = roverResearch?.length || 0
const maxWaypoints = 4 + (roverWaypointUpgrades * 2) // 4, 6
```

## Mineral Deposit System

### Overview

**Purpose**: Reward active classifiers with extractable resources

**Trigger**: After certain classification types
**Probability**: 1 in 3 chance (33.33%)
**Requirements**:
1. User has relevant mineral research unlocked
2. Planet is compatible (has stats from satellite survey)
3. Probability roll succeeds

### Complete Mineral Deposit Creation Flow

**File**: `/src/utils/mineralDepositCreation.ts`

**Step 1: Check Research**:
```typescript
async function hasMineralResearch(supabase, userId) {
  const { data } = await supabase
    .from('inventory')
    .select('item')
    .eq('owner', userId)
    .eq('item', 3103) // Mineral detection item
  
  return data && data.length > 0
}

// Alternative check via researched table
const { data } = await supabase
  .from('researched')
  .select('tech_type')
  .eq('user_id', userId)
  .in('tech_type', ['findMinerals', 'p4Minerals'])

const hasResearch = data && data.length > 0
```

**Step 2: Check Planet Compatibility**:
```typescript
async function isPlanetCompatible(supabase, userId, anomalyId, classificationId) {
  // For cloud classifications, check parent planet
  const { data: classification } = await supabase
    .from('classifications')
    .select('classificationConfiguration')
    .eq('id', classificationId)
    .single()
  
  const parentPlanetId = classification.classificationConfiguration?.parentPlanet
  
  if (parentPlanetId) {
    // Fetch parent planet classification
    const { data: planetClass } = await supabase
      .from('classifications')
      .select('classificationConfiguration')
      .eq('id', parentPlanetId)
      .single()
    
    const stats = planetClass.classificationConfiguration
    
    // Check if stats exist and are valid
    return stats && 
           stats.planet_radius && stats.planet_radius !== 'N/A' &&
           stats.planet_density && stats.planet_density !== 'N/A' &&
           stats.planet_mass && stats.planet_mass !== 'N/A'
  }
  
  return true // Direct planet classifications bypass this check
}
```

**Step 3: Roll for Deposit**:
```typescript
function rollForMineralDeposit(): boolean {
  return Math.random() < 1 / 3 // 33.33% chance
}
```

**Step 4: Select Mineral Type**:

Cloud on Mars:
```typescript
function selectCloudMineral() {
  const minerals = ['water-ice', 'co2-ice']
  const selected = minerals[Math.floor(Math.random() * minerals.length)]
  
  return {
    type: selected,
    amount: Math.random() * 100 + 50, // 50-150 units
    purity: Math.random() * 0.3 + 0.7, // 70-100%
    metadata: {
      source: 'cloud-classification',
      discoveryMethod: 'spectral-analysis'
    }
  }
}
```

Jovian Vortex:
```typescript
function selectJovianMineral() {
  const roll = Math.random()
  let mineral
  
  if (roll < 0.5) mineral = 'metallic-hydrogen'
  else if (roll < 0.75) mineral = 'metallic-helium'
  else if (roll < 0.9) mineral = 'methane'
  else mineral = 'ammonia'
  
  return {
    type: mineral,
    amount: Math.random() * 150 + 100, // 100-250 units
    purity: Math.random() * 0.2 + 0.75, // 75-95%
    metadata: { source: 'jovian-atmosphere' }
  }
}
```

Planet Four:
```typescript
function selectPlanetFourMineral(annotations) {
  const roll = Math.random()
  let mineral
  
  if (roll < 0.4) mineral = 'dust'
  else if (roll < 0.7) mineral = 'soil'
  else mineral = 'water-vapour'
  
  return {
    type: mineral,
    amount: Math.random() * 60 + 30, // 30-90 units
    purity: Math.random() * 0.25 + 0.65, // 65-90%
    metadata: {
      source: 'surface-analysis',
      annotations: annotations || [],
      surfaceType: mineral === 'water-vapour' ? 'polar' : 'equatorial'
    }
  }
}
```

AI4M Terrain:
```typescript
function selectAI4MMiner() {
  const minerals = ['iron-ore', 'cultivable-soil', 'copper', 'aluminum', 'silicate']
  const selected = minerals[Math.floor(Math.random() * minerals.length)]
  
  return {
    type: selected,
    amount: Math.random() * 80 + 40, // 40-120 units
    purity: Math.random() * 0.3 + 0.6, // 60-90%
    metadata: { source: 'rover-analysis' }
  }
}
```

**Step 5: Create Database Entry**:
```typescript
async function createMineralDeposit({
  supabase,
  userId,
  anomalyId,
  classificationId,
  mineralConfig,
  location
}) {
  const { data, error } = await supabase
    .from('mineralDeposits')
    .insert({
      owner: userId,
      anomaly: anomalyId,
      discovery: classificationId,
      mineralconfiguration: {
        type: mineralConfig.type,
        amount: mineralConfig.amount,
        quantity: mineralConfig.amount,
        purity: mineralConfig.purity,
        metadata: mineralConfig.metadata
      },
      location: location,
      created_at: new Date().toISOString()
    })
    .select()
    .single()
  
  if (!error) {
    console.log(`✅ Mineral deposit created: ${mineralConfig.type} at ${location}`)
    return { success: true, depositId: data.id }
  }
  
  return { success: false, error }
}
```

**Step 6: Main Orchestration**:
```typescript
async function attemptMineralDepositCreation(params) {
  // 1. Check research
  const hasResearch = await hasMineralResearch(params.supabase, params.userId)
  if (!hasResearch) {
    console.log('❌ No mineral research unlocked')
    return false
  }
  
  // 2. Check planet compatibility
  const isCompatible = await isPlanetCompatible(
    params.supabase,
    params.userId,
    params.anomalyId,
    params.classificationId
  )
  if (!isCompatible) {
    console.log('❌ Planet not compatible')
    return false
  }
  
  // 3. Roll for deposit
  if (!rollForMineralDeposit()) {
    console.log('❌ Deposit roll failed')
    return false
  }
  
  // 4. Create deposit
  const result = await createMineralDeposit(params)
  return result.success
}
```

### Mineral Deposit Database

**Table**: `mineralDeposits`
```sql
CREATE TABLE mineralDeposits (
  id SERIAL PRIMARY KEY,
  owner UUID REFERENCES profiles(id),
  anomaly INTEGER REFERENCES anomalies(id),
  discovery INTEGER REFERENCES classifications(id),
  mineralconfiguration JSONB,
  location TEXT,
  roverName TEXT, -- Optional: for rover discoveries
  created_at TIMESTAMP WITH TIME ZONE
)
```

**Configuration Structure**:
```typescript
interface MineralConfiguration {
  type: MineralType
  amount: number // Quantity in units
  quantity: number // Duplicate for compatibility
  purity: number // 0-1 or 0-100 percentage
  metadata: {
    source: 'cloud-classification' | 'jovian-atmosphere' | 'surface-analysis' | 'rover-analysis'
    discoveryMethod?: string
    coordinates?: { x: number, y: number }
    annotations?: any[]
    terrain?: string
    surfaceType?: string
  }
}
```

**Mineral Types**:
```typescript
type MineralType =
  | 'water-ice'      // Clouds, P4
  | 'co2-ice'        // Clouds, P4
  | 'metallic-hydrogen' // JVH
  | 'metallic-helium'   // JVH
  | 'methane'        // JVH
  | 'ammonia'        // JVH
  | 'soil'           // P4, AI4M
  | 'dust'           // P4
  | 'water-vapour'   // P4
  | 'iron-ore'       // AI4M
  | 'cultivable-soil' // AI4M
  | 'copper'         // AI4M
  | 'aluminum'       // AI4M
  | 'silicate'       // AI4M
  | 'gold'           // Future
```

### Integration Points

**Cloud on Mars Component**:
```typescript
// src/components/classification/cloudspottingOnMars.tsx
async function onClassificationComplete(classificationId) {
  const mineralConfig = selectCloudMineral()
  
  await attemptMineralDepositCreation({
    supabase,
    userId: session.user.id,
    anomalyId: currentAnomaly.id,
    classificationId,
    mineralConfig,
    location: `Mars Cloud Formation #${currentAnomaly.id}`
  })
}
```

**AI4M Component**:
```typescript
// Similar pattern after terrain classification submission
const mineralConfig = selectAI4MMiner()
await attemptMineralDepositCreation({
  mineralConfig,
  location: `Rover Waypoint ${waypointIndex}`,
  // ...other params
})
```

## Inventory & Resource Management

### Inventory Page

**Path**: `/inventory`

**Purpose**: View and manage discovered resources

**Sections**:
1. **Deployed Structures Status**
   - Telescope: Shows if deployed, anomaly count
   - Satellites: Count, current missions
   - Rover: Status, waypoint progress

2. **Mineral Deposits**
   - Grid of discovered deposits
   - Filters by type, location, project
   - Extraction status (available/extracted)

3. **Awaiting Classification**
   - Linked anomalies not yet classified
   - Unlock timers for satellites
   - Quick access to classification interfaces

### Mineral Deposit Cards

**Display Information**:
```typescript
interface MineralDepositCard {
  id: number
  mineralType: string // Display name
  quantity: number
  purity: number // Percentage
  location: string
  projectType: 'P4' | 'cloudspotting' | 'JVH' | 'AI4M'
  discoveryId?: number // Link to classification
  roverName?: string // If rover discovery
  extractionMethod: 'rover' | 'satellite'
}
```

**Visual Components**:
- Colored icon based on mineral type
- Quantity bar/meter
- Purity badge
- Difficulty indicator (easy/moderate/hard)
- Extract button or Research prompt
- View Discovery link

**Filtering**:
```typescript
const { data: deposits } = await supabase
  .from('mineralDeposits')
  .select('id, mineralconfiguration, location, roverName, discovery')
  .not('location', 'is', null)
  .eq('owner', userId)

// Filter out extracted (quantity <= 0)
const validDeposits = deposits.filter(d => {
  const quantity = d.mineralconfiguration?.amount || d.mineralconfiguration?.quantity || 0
  return quantity > 0
})
```

### Extraction Process

**Path**: Mineral deposit card → Extract button → `/extraction/[id]`

**Prerequisites**:
- Rover deposits: Must have `roverExtraction` research
- Satellite deposits: Must have `satelliteExtraction` research
- Without research: Button redirects to `/research`

**Extraction Scene**:
```typescript
// Component: ExtractionScene
interface Props {
  id: number
  mineralConfiguration: MineralConfiguration
  location: string
  discoveryId?: number
  roverName?: string
  projectType: 'P4' | 'cloudspotting' | 'JVH' | 'AI4M'
}
```

**Extraction Minigame**:
1. **Visual Scene**:
   - Mineral visualization with color coding
   - Extraction tool animation (drill for rover, satellite for remote)
   - Progress bar

2. **Extraction Logic**:
```typescript
async function executeExtraction() {
  setExtracting(true)
  
  // Animate progress over 3-5 seconds
  let progress = 0
  const interval = setInterval(() => {
    progress += 2
    setProgress(progress)
    
    if (progress >= 100) {
      clearInterval(interval)
      finalizeExtraction()
    }
  }, 50)
}

async function finalizeExtraction() {
  // Update database - set quantity to 0
  await supabase
    .from('mineralDeposits')
    .update({
      mineralconfiguration: {
        ...currentConfig,
        amount: 0,
        quantity: 0,
        extracted: true,
        extractedAt: new Date().toISOString()
      }
    })
    .eq('id', depositId)
  
  setExtracted(true)
  
  // Show success message with yield
  const yield = calculateYield(quantity, purity)
  toast.success(`Extracted ${yield} units of ${mineralType}!`)
}
```

3. **Yield Calculation**:
```typescript
function calculateYield(amount: number, purity: number): number {
  // Purity might be 0-1 or 0-100, normalize to 0-1
  const normalizedPurity = purity > 1 ? purity / 100 : purity
  
  // Yield = amount * purity * random variance (0.9-1.1)
  const variance = Math.random() * 0.2 + 0.9
  return Math.round(amount * normalizedPurity * variance)
}
```

4. **Particle Effects**:
   - Animated particles during extraction
   - Color-coded based on mineral type
   - Success celebration on completion

5. **Post-Extraction**:
   - Deposit marked as extracted (quantity = 0)
   - Removed from active inventory display
   - User can view discovery classification
   - Resources added to total inventory count (future: crafting system)

### Inventory Items (Legacy System)

**Note**: Original inventory system with item IDs is being phased out in favor of mineral deposits

**Current Items**:
- Item 3103: Mineral Detection capability
- Items 23, 24: Base equipment (telescope, satellite)

**Query**:
```typescript
const { data: items } = await supabase
  .from('inventory')
  .select('item')
  .eq('owner', userId)
```

**Integration**:
- Mineral research checks inventory for item 3103
- Will be fully replaced by `researched` table checks

##  Social Features

### Activity Feed System
**Path**: Main dashboard → Recent Activity section

1. **Activity Types**:
   - **Comments on Classifications**: Community feedback
   - **Votes on Classifications**: Peer review system
   - **Recent Classifications**: Other users' contributions
   - **New Discoveries**: Mineral/planet discoveries

2. **Community Interaction**:
   - **Commenting System**: Text-based feedback on classifications
   - **Voting System**: Upvote/downvote classification quality
   - **Activity Timeline**: Chronological feed of community actions

3. **Social Benefits**:
   - Additional deployment opportunities through community engagement
   - +1 deploy for every 3 votes on others' classifications (within 7 days)
   - +1 deploy for each comment on others' classifications (within 7 days)
   - Recognition for helpful contributions
   - Knowledge sharing and learning

### Post & Comments Flow
**Path**: `/posts/[id]` → Individual classification discussion

1. **Classification Details**:
   - Full classification data display
   - Media assets and annotations
   - Author information and timestamp
   - Planet stats with info buttons (shows "Measured by classification #X")

2. **Comment Thread**:
   - Nested comment system
   - Reply functionality
   - Vote tallying and display
   - Real-time updates

3. **Community Validation**:
   - Peer review process
   - Quality indicators based on votes
   - Consensus building mechanisms
   - Link sharing to specific classifications

### Leaderboards & Recognition
- **Classification Point System**: Total stardust/classifications
- **Community Rankings**: Competitive elements
- **Achievement Badges**: Milestone recognition
- **Referral Rewards**: Community growth incentives (referral code system)

## Annotation & Data Interaction

### Image Annotation System
**Path**: Any classification interface with image data

1. **Annotation Tools**:
   - **Drawing Tools**: Pen, circle, square annotation shapes
   - **Category System**: Project-specific annotation categories
   - **Color Coding**: Different colors for different feature types
   - **Line Width Control**: Precision adjustment
   - **Undo/Redo**: Action history management

2. **Category-Specific Tools**:
   - **AI4M** (Mars terrain): Sand, rock, soil classifications
   - **P4** (Planet Four): Fan and blotch identification  
   - **JVH** (Jovian Vortex): Storm and turbulence marking
   - **CoM** (Cloudspotting): Cloud type and color coding

3. **Annotation Workflow**:
   - Select annotation tool and category
   - Draw directly on image data
   - **Legend Component** tracks annotation counts
   - Save annotated images to cloud storage
   - Submit annotations with classification
   - Export PNG with annotations overlaid

### Data Upload & Media System
1. **Media Storage**: Supabase storage integration (`/storage/v1/object/`)
2. **Annotation Export**: PNG export of annotated images  
3. **Multi-Asset Support**: Multiple images per classification
4. **Cross-referencing**: Link annotations to database records via `media` array

## Technical Database Schema

### Core Tables

**profiles**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  avatar_url TEXT,
  push_subscription JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
```

**anomalies**:
```sql
CREATE TABLE anomalies (
  id SERIAL PRIMARY KEY,
  content TEXT, -- Name/identifier
  anomalytype TEXT,
  anomalySet TEXT, -- Project identifier
  configuration JSONB,
  avatar_url TEXT,
  parentAnomaly INTEGER REFERENCES anomalies(id)
)
```

**classifications**:
```sql
CREATE TABLE classifications (
  id SERIAL PRIMARY KEY,
  author UUID REFERENCES profiles(id),
  anomaly INTEGER REFERENCES anomalies(id),
  content TEXT, -- Legacy "key:value" format
  classificationConfiguration JSONB, -- Modern structured data
  media TEXT[], -- Array of image URLs
  classificationtype TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
```

**linked_anomalies**:
```sql
CREATE TABLE linked_anomalies (
  id SERIAL PRIMARY KEY,
  author UUID REFERENCES profiles(id),
  anomaly_id INTEGER REFERENCES anomalies(id),
  classification_id INTEGER REFERENCES classifications(id),
  automaton TEXT, -- Structure type
  date TIMESTAMP WITH TIME ZONE,
  unlocked BOOLEAN DEFAULT NULL,
  unlock_time TIMESTAMP WITH TIME ZONE
)
-- Indexes
CREATE INDEX idx_linked_author_automaton ON linked_anomalies(author, automaton);
CREATE INDEX idx_linked_unlocked ON linked_anomalies(unlocked) WHERE unlocked IS NOT NULL;
```

**researched**:
```sql
CREATE TABLE researched (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  tech_type TEXT,
  tech_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
)
-- Index
CREATE INDEX idx_researched_user_tech ON researched(user_id, tech_type);
```

**mineralDeposits**:
```sql
CREATE TABLE mineralDeposits (
  id SERIAL PRIMARY KEY,
  owner UUID REFERENCES profiles(id),
  anomaly INTEGER REFERENCES anomalies(id),
  discovery INTEGER REFERENCES classifications(id),
  mineralconfiguration JSONB,
  location TEXT,
  roverName TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
-- Index
CREATE INDEX idx_mineral_owner ON mineralDeposits(owner);
```

**routes**:
```sql
CREATE TABLE routes (
  id SERIAL PRIMARY KEY,
  author UUID REFERENCES profiles(id),
  routeConfiguration JSONB, -- Waypoints and anomaly assignments
  timestamp TIMESTAMP WITH TIME ZONE
)
```

**comments**:
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  author UUID REFERENCES profiles(id),
  classification INTEGER REFERENCES classifications(id),
  content TEXT,
  parent_comment INTEGER REFERENCES comments(id),
  created_at TIMESTAMP WITH TIME ZONE
)
```

**votes**:
```sql
CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  author UUID REFERENCES profiles(id),
  classification INTEGER REFERENCES classifications(id),
  vote_type TEXT, -- 'upvote' or 'downvote'
  created_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(author, classification)
)
```

## Complete User Journey Examples

### New User Journey: From Registration to First Discovery

1. **Initial Registration** (Anonymous Quick Start)
   - Visit `/auth` → Click "Continue as Guest"
   - Automatic profile creation and fast deploy activation
   - Welcome tutorial begins

2. **First Deployment**
   - Navigate to main dashboard
   - See telescope deployment prompt
   - Click "Deploy Telescope" → Select sector
   - **Fast Deploy**: Anomalies available immediately
   - 4 planets/asteroids linked to account

3. **First Classification**
   - Navigate to `/structures/telescope`
   - Access first planet light curve (unlocked instantly)
   - Analyze brightness data for transits
   - Submit classification: "Repeating dips detected"
   - **Result**: +1 stardust, fast deploy now disabled

4. **Satellite Deployment**
   - Return to dashboard, see satellite deployment unlocked
   - Deploy satellite to classified planet
   - Select "Weather Analysis" mode
   - 4 cloud anomalies linked (now with normal unlock schedule)

5. **First Mineral Discovery**
   - Wait for satellite unlock (or use remaining fast deploy)
   - Classify Mars cloud formation
   - **Trigger**: 1/3 chance roll succeeds
   - **Result**: Water-ice deposit discovered!
   - Notification: "New mineral deposit detected!"

6. **Extraction & Research**
   - Visit `/inventory` to see mineral deposit
   - Click "Extract" → Redirected to `/research`
   - Need `satelliteExtraction` upgrade (2 stardust)
   - Not enough stardust yet - classify more

7. **Community Engagement**
   - View activity feed, see others' classifications
   - Leave helpful comment on another user's planet discovery
   - **Benefit**: Earn +1 telescope deployment for this week

8. **Research Unlock**
   - Reach 2 total classifications
   - Purchase `satelliteExtraction` for 2 stardust
   - Return to mineral deposit
   - Execute extraction minigame
   - Successfully extract water-ice!

9. **Account Conversion**
   - Prompted to upgrade to permanent account
   - Add email for notifications and multi-device access
   - Join community leaderboard
   - Progress preserved

### Advanced User Journey: Multi-Project Engagement

1. **Weekly Planning** (Sunday Morning)
   - Check `/research` dashboard for goals
   - Review available stardust: 45 points
   - Plan: Purchase NGTS access (2) + Save for telescope upgrade (10)

2. **Telescope Deployment**
   - Deploy telescope to high-density sector
   - 6 anomalies linked (has telescope upgrade)
   - Mix of TESS planets and active asteroids

3. **Daily Classification Routine**
   - **Morning**: 2 Planet Hunter TESS classifications
   - **Afternoon**: 1 NGTS classification (higher difficulty)
   - **Evening**: 1 asteroid tracking, 1 sunspot count
   - **Total**: +5 stardust for the day

4. **Satellite Mission Management**
   - **Monday**: Deploy weather satellite to Planet A
   - Anomalies unlock: 1 per day over 4 days
   - **Tuesday**: Classify first Mars cloud, discover CO2-ice
   - **Wednesday**: Classify Jovian vortex, discover metallic-hydrogen
   - **Thursday**: Classify Planet Four, discover dust deposit
   - **Friday**: Final cloud classification

5. **Rover Deployment** (Mid-Week)
   - Has 20+ AI4M terrain classifications
   - Deploy rover with 6 waypoints (has upgrade)
   - Waypoints 4 marked as mineral deposit
   - Classify terrain at each waypoint
   - **Result**: 2 mineral deposits (iron-ore, cultivable-soil)

6. **Resource Extraction Week**
   - Extract all discovered minerals (5 total)
   - Portfolio: Water-ice, CO2-ice, metallic-hydrogen, dust, iron-ore
   - Total yield: ~400 units across all deposits

7. **Community Leadership**
   - Review 5 other users' classifications
   - Leave detailed feedback comments
   - **Result**: +5 bonus telescope deployments earned
   - Vote on 10 classifications throughout week

8. **Week-End Research Investment**
   - Total classifications this week: 35
   - Lifetime total: 120 classifications
   - Spent: 12 (previous upgrades)
   - Available: 108 stardust
   - Purchase: Spectroscopy (2) + Save rest for future

### Research Impact Journey: From Citizen to Scientist

1. **Skill Specialization**
   - Focus on Planet Hunters (100+ classifications)
   - Master light curve interpretation
   - Achieve 95% consensus validation rate
   - Recognized as "Expert Classifier" badge

2. **Data Quality Leadership**
   - Classifications regularly match professional astronomer validations
   - Contribute to "gold standard" training datasets
   - Selected for advanced NGTS beta testing
   - Mentor new users through detailed comments

3. **Scientific Publication**
   - Data contributions included in peer-reviewed exoplanet catalog
   - Named in research paper acknowledgments
   - 5 planet candidates confirmed by follow-up observations
   - Direct collaboration invitation from research team

4. **Community Building**
   - Recruit 10 new users through referral system
   - Organize classification challenge events
   - Create tutorial content for complex projects
   - Bridge citizen science community with professional research institutions

---

This documentation captures the complete Star Sailors experience from initial user interaction through advanced research contribution, demonstrating how gamification mechanics, resource systems, and community features enhance scientific discovery and data quality.


# Star Sailors: A Comprehensive Guide to Citizen Science

This document provides a comprehensive overview of the citizen science projects within the Star Sailors application. It details each project, its connection to the core game mechanics, and the user flow from deployment to discovery.

## 1. Core Concepts

Star Sailors is a gamified platform where users engage in real scientific research by classifying astronomical and planetary data. The core loop involves:

-   **Deployment**: Users deploy virtual structures like Telescopes, Satellites, and Rovers to gather data.
-   **Classification**: Users analyze the collected data, contributing to various research projects.
-   **Progression**: By classifying data, users earn **Stardust**, the primary in-game currency, which is used to research upgrades for their equipment.
-   **Discovery**: Classifications can lead to the discovery of in-game resources like **Mineral Deposits**.
-   **Community**: The platform includes social features like voting and commenting on classifications, fostering a collaborative environment.

## 2. The Deployment Structures

Users interact with the citizen science projects through three main types of deployable structures:

-   **Telescope**: Used for observing celestial objects like exoplanets, asteroids, and sunspots.
-   **Satellite**: Deployed to orbit planets, gathering data on weather patterns, atmospheric composition, and surface features.
-   **Rover**: Deployed on planetary surfaces to analyze terrain and search for minerals.

Each structure has a weekly deployment cycle and can be upgraded through the research system to enhance its capabilities.

## 3. Telescope-Based Citizen Science Projects

The Telescope is the gateway to several deep-space observation projects.

### 3.1. Planet Hunters (TESS and NGTS)

-   **Objective**: Identify exoplanet candidates by analyzing stellar light curves.
-   **User Task**: Users examine graphs of star brightness over time, looking for the characteristic dips that indicate a planet is transiting in front of its star.
-   **Mechanics**:
    -   **TESS**: The introductory level, available to all users.
    -   **NGTS**: A more advanced project with higher-quality data, unlocked via the **NGTS Access** research upgrade (cost: 2 Stardust).
-   **Interconnections**:
    -   Successful planet classifications are the prerequisite for deploying a **Weather Satellite** to that planet.
    -   Planet classifications can be further analyzed to determine planetary statistics like mass, radius, and density, which is a requirement for mineral discovery.

### 3.2. Daily Minor Planet

-   **Objective**: Discover and track asteroids.
-   **User Task**: Users compare a series of images of the same patch of sky, looking for objects that move between frames. This is a classic "blink comparator" task.
-   **Interconnections**: Classifying asteroids can unlock the "Active Asteroids" anomaly set, adding more variety to Telescope deployments.

### 3.3. Sunspot Classification

-   **Objective**: Monitor the activity of a G-type star to provide early warnings of solar flares.
-   **User Task**: Users count and describe the shape of sunspots on images of the star's surface.
-   **Mechanics**: This is a continuous, community-wide effort. There's a 5-minute cooldown between classifications for each user. The total number of community classifications determines the number of sunspots rendered on a 3D model of the star.

### 3.4. Disk Detective

-   **Objective**: Find stars surrounded by circumstellar disks, which are indicators of planetary system formation.
-   **User Task**: Users examine multi-wavelength infrared images to identify stars with extended emission, a sign of a surrounding disk.

## 4. Satellite-Based Citizen Science Projects

Once a user has discovered a planet, they can deploy a satellite to it, unlocking a new suite of atmospheric and surface science projects. Satellite anomalies unlock on a daily schedule unless the user has the "Fast Deploy" gift for new users.

### 4.1. Cloudspotting on Mars

-   **Objective**: Identify and classify cloud formations in the Martian atmosphere.
-   **User Task**: Users draw boundaries around clouds in satellite images and classify them as water ice, CO2, or dust.
-   **Interconnections**:
    -   This is a primary trigger for the **Mineral Deposit System**. A successful cloud classification has a 1-in-3 chance of creating a water-ice or CO2-ice deposit, provided the user has the necessary research unlocked.

### 4.2. Jovian Vortex Hunters (JVH)

-   **Objective**: Study the atmospheric dynamics of gas giants.
-   **User Task**: Users identify and mark cyclonic and anticyclonic vortices (storms) in images of Jupiter-like planets.
-   **Interconnections**: Triggers the discovery of atmospheric minerals like metallic-hydrogen and methane.

### 4.3. Planet Four (P4)

-   **Objective**: Track seasonal changes on the surface of Mars, caused by the sublimation of ice.
-   **User Task**: Users identify and mark "fans" and "blotches," which are dark streaks and patches that appear as ice turns directly into gas.
-   **Interconnections**: Can lead to the discovery of surface deposits like dust, soil, and water-vapor. Requires the `p4Minerals` research to be unlocked.

## 5. Rover-Based Citizen Science Projects

Rovers are deployed to planetary surfaces, allowing for ground-truth analysis.

### 5.1. AI for Mars (AI4M)

-   **Objective**: Train machine learning models for autonomous rover navigation.
-   **User Task**: Users classify terrain features in images taken by a rover, identifying areas of sand, bedrock, soil, and different types of rock.
-   **Interconnections**:
    -   Requires the `findMinerals` research to be unlocked.
    -   Successful terrain classification can trigger the discovery of terrestrial minerals like iron ore, copper, and cultivable soil.
    -   The `roverwaypoints` research upgrade increases the number of waypoints a rover can have, leading to more classification opportunities.

## 6. Other Citizen Science Projects

### 6.1. Zoodex: Burrowing Owls

-   **Objective**: Monitor the behavior of burrowing owls.
-   **User Task**: Users classify images of owls, identifying adults and babies. This project seems to be part of a "Biodome" structure.

## 7. Interconnected Systems

The citizen science projects are deeply integrated with the game's core progression and economy.

### 7.1. The Economy: Stardust

-   Every classification, regardless of the project, earns the user **1 Stardust**.
-   Stardust is spent on the **Research & Upgrade System**.

### 7.2. Research & Upgrades

-   Users spend Stardust to unlock new capabilities and improve their equipment.
-   **Quantity Upgrades** (10 Stardust each): Increase the number of anomalies per deployment (e.g., `probereceptors` for the Telescope).
-   **Data/Measurement Upgrades** (2 Stardust each): Unlock new projects (`ngtsAccess`) or new data within existing projects (`spectroscopy`).
-   **Extraction Upgrades** (2 Stardust each): Enable the extraction of discovered minerals (`roverExtraction`, `satelliteExtraction`).

### 7.3. Mineral Deposit & Extraction System

-   This system is a direct reward for classification.
-   **Trigger**: Completing classifications in projects like Cloudspotting, JVH, P4, and AI4M.
-   **Probability**: There is a 1-in-3 chance of creating a deposit upon a successful, eligible classification.
-   **Requirements**: The user must have the appropriate mineral-finding research unlocked, and the target planet must be "compatible" (i.e., have its physical stats calculated from a satellite survey).
-   **Extraction**: To collect the resources from a deposit, the user must have the corresponding extraction research unlocked.

### 7.4. Social & Community Features

-   **Activity Feed**: Shows recent classifications, comments, and votes from the community.
-   **Voting and Commenting**: Users can provide feedback on each other's classifications. This peer-review system helps validate data.
-   **Rewards for Engagement**: Users are rewarded for social interaction. For example, making 3 votes or 1 comment on others' classifications can earn a user an extra Telescope deployment for the week.
-   **Leaderboards**: Rank users based on their contributions, fostering friendly competition.

## 8. Example User Flow: From First Planet to First Mineral

1.  A new user starts the game and gets the **Fast Deploy** gift.
2.  They deploy their **Telescope** and immediately get access to several anomalies.
3.  They classify a light curve from the **Planet Hunters** project and identify an exoplanet. They earn 1 Stardust. Their Fast Deploy is now used up for future deployments.
4.  Having discovered a planet, they can now deploy a **Satellite** to it. They choose the "Weather Analysis" mission.
5.  The satellite's cloud anomalies unlock over the next few days.
6.  The user classifies a cloud formation in the **Cloudspotting on Mars** project. They earn another Stardust.
7.  Because the user has 2 Stardust, they go to the `/research` page and purchase the `satelliteExtraction` upgrade.
8.  On their next cloud classification, the 1-in-3 probability roll is successful. A **water-ice mineral deposit** is created and linked to their account.
9.  The user navigates to their `/inventory`, sees the new deposit, and because they have the `satelliteExtraction` upgrade, they can perform the extraction minigame to collect the resources.
