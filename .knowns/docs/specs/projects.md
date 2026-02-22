---
title: "Star Sailors Citizen Science Projects - Complete Specification"
---

# Star Sailors Citizen Science Projects - Complete Specification

**Document Version:** 1.0  
**Last Updated:** February 22, 2026  
**Purpose:** Comprehensive specification of all citizen science projects, their methods, contributions, Zooniverse connections, in-game mechanics, and anomaly discovery systems.

---

## Table of Contents

1. [Overview](#overview)
2. [Telescope-Based Projects](#telescope-based-projects)
3. [Satellite-Based Projects](#satellite-based-projects)
4. [Rover-Based Projects](#rover-based-projects)
5. [Biodome-Based Projects](#biodome-based-projects)
6. [Anomaly Discovery & Deployment Systems](#anomaly-discovery--deployment-systems)
7. [Mineral Deposit Creation System](#mineral-deposit-creation-system)
8. [In-Game Relationships & Progression](#in-game-relationships--progression)

---

## Overview

Star Sailors integrates **11 distinct citizen science projects** across **4 deployment structures**. All projects contribute to real scientific research while gamifying the experience through stardust rewards, mineral deposits, and progressive unlocks.

### Core Mechanics Across All Projects

- **Classification Reward:** 1 Stardust per classification (all projects equal)
- **Classification Storage:** `classifications` table with `classificationtype` field
- **Weekly Deployment Cycle:** Sunday 00:01 AEST reset
- **Fast Deploy Mechanic:** First-time users get instant access to all anomalies
- **Mineral Discovery:** 1 in 3 chance when requirements are met

---

## Telescope-Based Projects

The Telescope is the entry point for deep-space observation projects. **Deployed via:** `/activity/deploy`

### 1. Planet Hunters (TESS & NGTS)

**Real-World Connection:** Transiting Exoplanet Survey Satellite (TESS) and Next-Generation Transit Survey (NGTS)  
**Zooniverse Project:** Based on Planet Hunters TESS methodology  
**Classification Type:** `planet` (TESS), `planet` (NGTS)  
**Anomaly Set:** `telescope-tess` (basic), `telescope-ngts` (upgraded)

#### What Users Do

Users examine stellar light curves (graphs of star brightness over time) to identify characteristic dips that indicate a planet is transiting in front of its star.

#### Classification Method

**Interface:** Image Annotator with light curve visualization  
**Task:** Mark and categorize transit dips  

**Classification Options:**
- No dips at all
- Repeating dips
- Dips with similar size
- Dips aligned to one side

**NGTS Additional Task (Upgraded):**
- Odd/Even Transit Check (annotation-based)
- Categories: "Yes" or "No" for transit alignment

**Route:** `/structures/telescope/planet-hunters/[id]/classify`

#### How Users Contribute

1. View light curve data from TESS/NGTS surveys
2. Identify potential transit events
3. Classify transit characteristics
4. Submit classification for validation

#### Anomaly Discovery

**Discovery Method:** Telescope Deployment
- Base deployment: 4 anomalies (6 with `probereceptors` research)
- 70% allocation ratio from `telescope-tess` pool
- NGTS unlocked after 4+ planet classifications via research upgrade (2 stardust)

**Database Query:**
```sql
SELECT id FROM anomalies 
WHERE "anomalySet" IN ('telescope-tess', 'telescope-ngts')
ORDER BY id DESC
```

#### In-Game Relationship

**Unlocks:**
- Satellite deployment to discovered planets
- Planetary statistics calculation
- Mineral deposit compatibility checks
- Planet Four & Cloudspotting missions

**Research Requirements:**
- **NGTS Access:** 2 stardust, requires 4+ planet classifications

---

### 2. Daily Minor Planet (Asteroid Hunt)

**Real-World Connection:** Minor Planet Center asteroid tracking  
**Zooniverse Project:** Active Asteroids concept  
**Classification Type:** `telescope-minorPlanet`  
**Anomaly Set:** `telescope-minorPlanet`, `active-asteroids` (unlockable)

#### What Users Do

Users examine a series of images of the same patch of sky, looking for objects that move between frames (classic "blink comparator" task).

#### Classification Method

**Interface:** Multi-image comparison viewer  
**Task:** Identify moving objects across image sequence

**Classification Options:**
- Object moves smoothly
- Object appears/disappears
- Multiple moving objects
- Stationary artifact
- Can't tell / object not visible

**Route:** `/structures/telescope/minor-planet/[id]/classify`

#### How Users Contribute

1. View time-series images of the same sky region
2. Identify objects that change position between frames
3. Distinguish real asteroids from image artifacts
4. Report movement characteristics

#### Anomaly Discovery

**Discovery Method:** Telescope Deployment
- 30% allocation ratio from minor planet pool
- After 2+ asteroid classifications, unlocks `active-asteroids` set

**Database Query:**
```sql
SELECT id FROM anomalies 
WHERE "anomalySet" IN ('telescope-minorPlanet', 'active-asteroids')
```

#### In-Game Relationship

**Unlocks:**
- Active Asteroids anomaly set (more variety)
- Adds to telescope deployment pool

**No Direct Mineral Connection**

---

### 3. Sunspot Classification

**Real-World Connection:** Solar monitoring for space weather prediction  
**Zooniverse Project:** N/A (custom implementation)  
**Classification Type:** `sunspot`  
**Anomaly Set:** `sunspot`

#### What Users Do

Users count and describe sunspots on images of a G-type star's surface to monitor solar activity and predict solar flares.

#### Classification Method

**Interface:** Annotation-based marking on solar surface  
**Task:** Count and categorize sunspots

**Classification Options:**
- Annotation-based (mark sunspot locations)
- Categories: Various sunspot types and sizes

**Route:** `/app/projects/sunspots`, `/viewports/sunspots`

#### How Users Contribute

1. View 3D model or image of solar surface
2. Identify dark spots (sunspots)
3. Count and mark locations
4. Classify by shape and intensity

#### Anomaly Discovery

**Discovery Method:** Continuous Participation (NOT weekly deployment)
- Users "participate" rather than "deploy"
- 5-minute cooldown between classifications per user
- Community classifications determine sunspot rendering

**Database Query:**
```sql
SELECT id FROM anomalies WHERE "anomalySet" = 'sunspot'
```

**Unlock Mechanic:**
- `unlocked: false` on participation
- Unlocks 1 hour after participation time
- Expires 3 days after participation

#### In-Game Relationship

**Purpose:** Community-wide solar monitoring  
**Community Effect:** Total classifications determine 3D solar model rendering  

**No Direct Mineral or Structure Unlocks**

---

### 4. Disk Detective

**Real-World Connection:** Circumstellar disk discovery  
**Zooniverse Project:** Disk Detective  
**Classification Type:** `DiskDetective`  
**Anomaly Set:** `diskDetective`

#### What Users Do

Users examine multi-wavelength infrared images to identify stars with extended emission, indicating a surrounding circumstellar disk (signs of planetary system formation).

#### Classification Method

**Interface:** Multi-wavelength image viewer  
**Task:** Identify extended emission beyond stellar point source

**Classification Options:**
- Object moves away from crosshairs in ONLY the 2MASS images
- Object moves away from crosshairs in two or more images
- The object is extended beyond the outer circle in the unWISE Images
- Two or more images show multiple objects inside the inner circle
- Two or more images show objects between the inner and outer circles
- The object of interest is not round in the Pan-STARRS, SkyMapper or 2MASS images
- None of the above

**Route:** `/structures/telescope/disk-detective/[id]/classify`

#### How Users Contribute

1. View infrared images across multiple wavelengths
2. Identify circular emission patterns
3. Distinguish extended disks from stellar artifacts
4. Report disk characteristics

#### Anomaly Discovery

**Discovery Method:** Telescope Deployment (Stellar Mode)
- Appears in "stellar" deployment type
- Mixed with variable star classifications

**Database Query:**
```sql
SELECT id FROM anomalies WHERE "anomalySet" = 'diskDetective'
```

#### In-Game Relationship

**Stellar Deployment Pool:** Part of advanced telescope observations  

**No Direct Mineral or Unlock Dependencies**

---

## Satellite-Based Projects

Satellites are deployed to orbit discovered planets. **Deployed via:** `/viewports/satellite/deploy`

**Prerequisites:** Must have classified at least one planet

### 5. Cloudspotting on Mars

**Real-World Connection:** Mars Climate Sounder (MCS) on Mars Reconnaissance Orbiter  
**Zooniverse Project:** Cloudspotting on Mars  
**Classification Type:** `cloud`, `balloon-marsCloudShapes`  
**Anomaly Set:** `cloudspottingOnMars`, `balloon-marsCloudShapes`

#### What Users Do

Users identify and classify cloud formations in the Martian atmosphere, drawing boundaries around clouds and categorizing them as water ice, CO₂, or dust.

#### Classification Method

**Interface:** Image annotation + classification form  
**Task:** Draw cloud boundaries and classify composition

**Classification Options (Initial - `cloud`):**
- Narrow arch
- Wide arch
- 1 cloud, 2 clouds, 3 clouds
- 4 clouds, 5+ clouds

**Classification Options (Shapes - `balloon-marsCloudShapes`):**
- Filament
- Wave
- Spiral
- Formation
- Cloud
- Arc

**Route:** `/structures/balloon/cloudspotting/[id]/classify`

#### How Users Contribute

1. View MCS infrared atmospheric data
2. Identify cloud formations
3. Mark cloud boundaries with annotation tools
4. Classify cloud composition and shape

#### Anomaly Discovery

**Discovery Method:** Satellite Deployment (Weather Analysis Mode)
- Base: 4 anomalies (6 with `satellitecount` research)
- Unlocks daily schedule (1 per day) unless Fast Deploy active
- Requires parent planet from planet classification

**Database Query:**
```sql
SELECT id FROM anomalies 
WHERE "anomalySet" IN ('cloudspottingOnMars', 'balloon-marsCloudShapes')
```

**Unlock Condition for Shapes:** 2+ cloud classifications

#### In-Game Relationship

**Primary Mineral Trigger:** 1 in 3 chance creates mineral deposit  
**Mineral Types:** Water-ice, CO₂-ice  

**Requirements for Mineral Discovery:**
1. User has `satelliteExtraction` research (2 stardust)
2. Parent planet has valid stats (mass, radius, density)
3. 1/3 probability roll succeeds

**Unlocks:**
- Mineral extraction minigame
- Atmospheric resource deposits
- Advanced weather analysis

---

### 6. Jovian Vortex Hunters (JVH)

**Real-World Connection:** Jupiter atmospheric dynamics (based on Juno mission)  
**Zooniverse Project:** Similar to Jovian Vortex Hunter concept  
**Classification Type:** `lidar-jovianVortexHunter`  
**Anomaly Set:** `lidar-jovianVortexHunter`

#### What Users Do

Users identify and mark cyclonic and anticyclonic vortices (storms) in images of Jupiter-like gas giant atmospheres.

#### Classification Method

**Interface:** Image Annotator (JVH mode)  
**Task:** Mark vortex locations and classify rotation direction

**Classification Options:**
- Annotation-based marking
- Categories: Cyclonic, Anticyclonic, Uncertain

**Route:** `/app/projects/jovian-vortex-hunter/[id]/classify`

#### How Users Contribute

1. View atmospheric imagery of gas giants
2. Identify storm systems and vortices
3. Mark vortex boundaries
4. Classify rotational characteristics

#### Anomaly Discovery

**Discovery Method:** Satellite Deployment (Weather Analysis Mode)
- Unlocked after 2+ cloud classifications
- Daily unlock schedule

**Database Query:**
```sql
SELECT id FROM anomalies WHERE "anomalySet" = 'lidar-jovianVortexHunter'
```

#### In-Game Relationship

**Mineral Trigger:** Gas giant atmospheric resources  
**Mineral Types:** Metallic-hydrogen, metallic-helium, methane, ammonia  

**Probability Distribution:**
- 50%: Metallic-hydrogen
- 25%: Metallic-helium
- 15%: Methane
- 10%: Ammonia

**Requirements:** Same as Cloudspotting (research + planet stats)

---

### 7. Planet Four (P4)

**Real-World Connection:** Mars seasonal changes from HiRISE observations  
**Zooniverse Project:** Planet Four  
**Classification Type:** `satellite-planetFour`  
**Anomaly Set:** `satellite-planetFour`

#### What Users Do

Users track seasonal changes on Mars caused by ice sublimation, identifying and marking "fans" and "blotches" (dark streaks from ice turning to gas).

#### Classification Method

**Interface:** Image annotation + classification form  
**Task:** Mark surface features and classify type

**Classification Options:**
- Dust Deposits
- Surface Cracks
- Spider-like Features
- Rocky Outcrops
- Smooth Terrain

**Route:** `/app/projects/planet-four/[id]/classify`

#### How Users Contribute

1. View HiRISE surface imagery
2. Identify seasonal surface changes
3. Mark fans and blotches
4. Classify surface composition

#### Anomaly Discovery

**Discovery Method:** Satellite Deployment (Wind Survey Mode)
- Requires planet with known radius
- 4-6 anomalies depending on research

**Database Query:**
```sql
SELECT id FROM anomalies WHERE "anomalySet" = 'satellite-planetFour'
```

#### In-Game Relationship

**Mineral Trigger:** Surface deposits  
**Mineral Types:** Dust, soil, water-vapour  

**Probability Distribution:**
- 40%: Dust
- 30%: Soil
- 30%: Water-vapour

**Research Required:** `p4Minerals` (2 stardust)

---

## Rover-Based Projects

Rovers are deployed to planetary surfaces for ground-truth analysis. **Deployed via:** `/activity/deploy/roover`

**Prerequisites:** Must have classified at least one AI4M terrain image

### 8. AI for Mars (AI4M)

**Real-World Connection:** NASA/JPL autonomous rover navigation ML training  
**Zooniverse Project:** AI4Mars  
**Classification Type:** `automaton-aiForMars`  
**Anomaly Set:** `automaton-aiForMars`

#### What Users Do

Users classify terrain features in rover images, identifying sand, bedrock, soil, and rock types to train machine learning models for autonomous navigation.

#### Classification Method

**Interface:** Image Annotator (AI4M mode)  
**Task:** Paint/mark terrain regions by type

**Classification Categories (Annotation-based):**
- Sand (fine, powdery with ripples)
- Consolidated Soil (cohesive, compact)
- Bedrock (large solid plates)
- Big Rocks (>20-50cm obstacles)
- Unlabelled (distant/unclear terrain)

**Route:** `/app/projects/ai-for-mars/[id]/classify`

#### How Users Contribute

1. View rover camera imagery
2. Paint terrain regions by classification
3. Identify hazards and navigable areas
4. Train ML models for autonomous driving

#### Anomaly Discovery

**Discovery Method:** Rover Deployment with Waypoint Planning
- Base: 4 waypoints (6 with `roverwaypoints` research)
- Allocates unclassified AI4M anomalies
- Every 4th waypoint can be mineral deposit

**Database Query:**
```sql
SELECT id FROM anomalies WHERE "anomalySet" = 'automaton-aiForMars'
```

#### In-Game Relationship

**Mineral Trigger:** Terrain-based resource discovery  
**Mineral Types:** Iron-ore, cultivable-soil, copper, gold, aluminum, water-ice, silicate  

**Mineral Selection Logic:**
- High soil (60%+): Cultivable-soil
- High bedrock (40%+): Iron-ore or silicate
- High sand (50%+): Water-ice (if polar)
- High rocks (35%+): Copper or aluminum
- Mixed terrain: Gold (25% chance) or iron-ore
- Default: Silicate

**Requirements:**
1. `findMinerals` research (2 stardust)
2. Planet compatibility (has stats)
3. 1/3 probability roll
4. Waypoint must be designated as mineral location

---

## Biodome-Based Projects

Biodome projects focus on wildlife observation and behavior tracking. **Accessed via:** Biodome structure (Item 3104)

### 9. Zoodex: Burrowing Owls

**Real-World Connection:** Wildlife behavior monitoring  
**Zooniverse Project:** Similar to Snapshot Safari methodology  
**Classification Type:** `zoodex-burrowingOwl`  
**Anomaly Set:** N/A (upload-based)

#### What Users Do

Users classify images of burrowing owls, identifying adults and babies, and documenting behavior events.

#### Classification Method

**Interface:** Image upload + classification form  
**Task:** Categorize owl presence and behavior

**Classification Options:**
- Adult owl
- Baby owl
- Mortality event
- Infanticide
- Prey delivery
- Mating
- Feeding
- Owls have bands

**Route:** Upload interface (not anomaly-based)

#### How Users Contribute

1. Upload or view wildlife camera images
2. Identify owl presence (adult/juvenile)
3. Document behavioral events
4. Track population dynamics

#### Anomaly Discovery

**Discovery Method:** Upload-based (no deployment)
- Users upload observations from biodome
- Stored in `uploads` and optionally `zoo` tables
- Not linked to anomaly system

**No Anomaly Pool** - User-generated content

#### In-Game Relationship

**Structure Required:** Biodome (Item 3104)  
**Purpose:** Population monitoring and behavioral research  

**No Direct Mineral or Unlock Dependencies**

---

### 10. Zoodex: Iguanas from Above

**Real-World Connection:** Aerial wildlife monitoring  
**Zooniverse Project:** Similar to aerial survey projects  
**Classification Type:** `zoodex-iguanasFromAbove`  
**Anomaly Set:** N/A (upload-based)

#### What Users Do

Users classify aerial/satellite images of iguanas, identifying males, females, juveniles, and lek formations.

#### Classification Method

**Interface:** Image upload + classification form  
**Task:** Categorize iguana observations

**Classification Options:**
- Adult Male not in a Lek
- Adult male with a Lek
- Juvenile/Female
- Partial iguana

#### How Users Contribute

1. View aerial imagery
2. Identify individual iguanas
3. Determine sex and maturity
4. Document lek (mating) formations

#### Anomaly Discovery

**Discovery Method:** Upload-based (no deployment)  
**No Anomaly Pool** - User-generated content

#### In-Game Relationship

**Structure Required:** Biodome  
**Purpose:** Population density and mating behavior tracking

---

### 11. Zoodex: South Coast Fauna Recovery

**Real-World Connection:** Australian biodiversity monitoring  
**Zooniverse Project:** Similar to Wildlife Watch concept  
**Classification Type:** `zoodex-southCoastFaunaRecovery`  
**Anomaly Set:** N/A (upload-based)

#### What Users Do

Users classify camera trap images from Australia's south coast, identifying various species of birds, mammals, and reptiles.

#### Classification Method

**Interface:** Image upload + multi-level classification form  
**Task:** Identify species from comprehensive list

**Classification Categories:**
- **Birds:** 10 species (ravens, wrens, falcons, etc.)
- **Large Mammals:** 7 species (echidnas, quokkas, kangaroos, etc.)
- **Small Mammals:** 8 species (cats, foxes, mice, rabbits, etc.)
- **Reptiles:** 4 species (skinks, monitors)
- **Other:** Faulty images, humans, generic categories

**Total:** 40+ distinct classification options

#### How Users Contribute

1. View camera trap footage
2. Identify species present
3. Document biodiversity
4. Track population trends

#### Anomaly Discovery

**Discovery Method:** Upload-based (no deployment)  
**No Anomaly Pool** - User-generated content

#### In-Game Relationship

**Structure Required:** Biodome  
**Purpose:** Ecosystem health monitoring and species recovery tracking

---

## Anomaly Discovery & Deployment Systems

### How Anomalies Appear in the Game

All anomalies exist in the `anomalies` database table and are "discovered" through deployment or participation systems.

#### Telescope Deployment Flow

1. **User Action:** Navigate to `/activity/deploy` and select sector
2. **Deployment Check:** System queries for existing telescope deployments in past 7 days
3. **Anomaly Allocation:**
   - Planetary Mode: 70% TESS, 30% Minor Planet (+ Active Asteroids if unlocked)
   - Stellar Mode: Mix of Disk Detective and Variable Stars
   - Quantity: 4 base, 6 with `probereceptors` research
4. **Database Insertion:** Creates `linked_anomalies` rows connecting user to assigned anomalies
5. **Result:** Anomalies appear in telescope viewport at `/structures/telescope`

**Code Example:**
```typescript
// Fetch available anomalies
const { data: anomalies } = await supabase
  .from('anomalies')
  .select('id')
  .in('anomalySet', ['telescope-tess', 'telescope-minorPlanet'])
  .limit(quantity)

// Link to user
const rows = anomalies.map(a => ({
  author: userId,
  anomaly_id: a.id,
  automaton: 'Telescope',
  date: new Date().toISOString(),
  unlocked: null
}))

await supabase.from('linked_anomalies').insert(rows)
```

#### Satellite Deployment Flow

1. **User Action:** Select planet from `/viewports/satellite/deploy`
2. **Mode Selection:** Weather Analysis, Planetary Survey, or Wind Survey
3. **Anomaly Allocation:**
   - Weather: Cloudspotting + JVH (if unlocked) + Mars Cloud Shapes (if unlocked)
   - Wind Survey: Planet Four
   - Quantity: 4-6 depending on research
4. **Unlock Schedule:** Anomalies unlock daily unless Fast Deploy active
5. **Database Insertion:** Creates `linked_anomalies` with `unlocked: false` and `unlock_time`

**Unlock Logic:**
```typescript
const now = new Date()
const unlockTime = new Date(linkedAnomaly.date)
unlockTime.setDate(unlockTime.getDate() + dayIndex) // dayIndex: 0-5

const isUnlocked = now >= unlockTime
```

#### Rover Deployment Flow

1. **User Action:** Plan waypoint route at `/activity/deploy/roover`
2. **Waypoint Configuration:** Place 4-6 waypoints on terrain map
3. **Anomaly Allocation:**
   - Prioritize unclassified AI4M anomalies
   - Assign one anomaly per waypoint
4. **Mineral Waypoints:** Every 4th waypoint marked for potential mineral discovery
5. **Route Storage:** Saves waypoint configuration to `routes` table
6. **Result:** All rover anomalies immediately available (no unlock delay)

#### Sunspot Participation Flow

1. **User Action:** Click "Participate" on Solar Health dashboard
2. **Anomaly Linking:** All sunspot anomalies linked to user
3. **Unlock Timer:** 1 hour delay before first classification available
4. **Expiration:** Participation expires after 3 days
5. **Cooldown:** 5-minute cooldown between individual sunspot classifications

#### Biodome Upload Flow

1. **User Action:** Upload image through biodome interface
2. **Storage:** File uploaded to Supabase storage bucket
3. **Database:** Entry created in `uploads` table
4. **Optional Zoo:** Can save to `zoo` table for persistent collection
5. **No Anomaly Link:** Biodome projects don't use anomaly system

---

## Mineral Deposit Creation System

### Universal Mineral Creation Logic

All mineral deposits follow this flow:

1. **User completes classification** → Classification ID generated
2. **System checks research unlock** → Queries inventory for mineral research items
3. **System checks planet compatibility** → Verifies parent planet has valid stats
4. **Probability roll** → 1 in 3 chance (33.33%)
5. **Mineral type selection** → Project-specific logic determines mineral
6. **Database insertion** → Creates entry in `mineral_deposits` table
7. **UI notification** → User sees deposit creation message

### Research Requirements by Project

| Project | Required Research | Item ID | Cost |
|---------|------------------|---------|------|
| Cloudspotting | Satellite Extraction | 31031 | 2 stardust |
| JVH | Satellite Extraction | 31031 | 2 stardust |
| Planet Four | P4 Minerals + Satellite Extraction | 31029 + 31031 | 4 stardust total |
| AI4M | Find Minerals + Rover Extraction | 31030 + 31032 | 4 stardust total |

### Planet Compatibility Check

A planet is "compatible" for mineral discovery if:
1. It has a classification with planet stats stored
2. Stats include: `planet_mass`, `planet_radius`, `planet_density`
3. Stats are not "N/A" or null
4. For cloud/atmospheric: Must reference parent planet classification

**Code Implementation:**
```typescript
async function isPlanetCompatible(userId, anomalyId, classificationId) {
  // Get classifications for this anomaly
  const { data: classifications } = await supabase
    .from('classifications')
    .select('classificationConfiguration')
    .eq('author', userId)
    .eq('anomaly', anomalyId)

  // Check if any classification has valid stats
  for (const c of classifications) {
    const config = JSON.parse(c.classificationConfiguration)
    if (config.planet_mass !== "N/A" && 
        config.planet_radius !== "N/A") {
      return true
    }
  }
  return false
}
```

### Mineral Selection by Project

#### Cloudspotting on Mars

**Function:** `selectCloudMineral()`  
**Types:** Water-ice (50%), CO₂-ice (50%)  
**Amount:** 50-150 units  
**Purity:** 70-100%

#### Jovian Vortex Hunters

**Function:** `selectJovianMineral()`  
**Types:**
- Metallic-hydrogen (50%)
- Metallic-helium (25%)
- Methane (15%)
- Ammonia (10%)

**Amount:** 100-600 units  
**Purity:** 60-100%

#### Planet Four

**Function:** `selectPlanetFourMineral()`  
**Types:**
- Dust (40%)
- Soil (30%)
- Water-vapour (30%)

**Amount:** 20-100 units  
**Purity:** 50-100%

#### AI for Mars

**Function:** `determineMineralType(classificationData)`  
**Complex Logic Based on Terrain:**
- High soil (60%+): Cultivable-soil
- High bedrock (40%+): Iron-ore or Silicate
- High sand (50%+): Water-ice (if polar region)
- High rocks (35%+): Copper or Aluminum
- Mixed terrain: Gold (25% chance)

**Amount:** 40-120 units  
**Purity:** 60-90%

### Mineral Deposit Database Schema

```sql
CREATE TABLE mineral_deposits (
  id SERIAL PRIMARY KEY,
  owner UUID REFERENCES profiles(id),
  anomaly INTEGER REFERENCES anomalies(id),
  discovery INTEGER REFERENCES classifications(id),
  mineralconfiguration JSONB,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  extracted BOOLEAN DEFAULT false
)
```

**Example mineralconfiguration:**
```json
{
  "type": "water-ice",
  "amount": 125.5,
  "purity": 0.87,
  "metadata": {
    "source": "cloud-classification",
    "discoveryMethod": "spectral-analysis"
  }
}
```

---

## In-Game Relationships & Progression

### Dependency Chain

```
1. Deploy Telescope
   ↓
2. Classify Planet (TESS/NGTS)
   ↓
3. Deploy Satellite to Planet
   ↓
4. Perform Planetary Survey
   ↓
5. Planet Stats Calculated (mass, radius, density)
   ↓
6. Deploy Weather Analysis Satellite
   ↓
7. Classify Clouds (Cloudspotting/JVH)
   ↓
8. Mineral Deposit Created (1/3 chance)
   ↓
9. Extract Minerals (requires extraction research)
```

### Parallel Progression Paths

#### Path A: Telescope → Rover
1. Deploy Telescope
2. Classify Planets
3. Classify AI4M terrain
4. Deploy Rover
5. Complete waypoint classifications
6. Discover terrestrial minerals

#### Path B: Continuous Solar Monitoring
1. Participate in Solar Health
2. Classify sunspots (no deployment cycle)
3. Contribute to community solar model
4. No mineral/unlock dependencies

#### Path C: Biodome Wildlife
1. Obtain Biodome structure
2. Upload wildlife observations
3. Classify species
4. Track populations
5. Independent from other systems

### Research Upgrade Impact

| Research | Cost | Effect | Unlocks |
|----------|------|--------|---------|
| Probe Receptors | 10 stardust | +2 telescope anomalies (4→6) | More classifications per week |
| Satellite Count | 10 stardust | +2 satellite anomalies (4→6) | More cloud data |
| Rover Waypoints | 10 stardust | +2 rover waypoints (4→6) | More terrain classifications |
| NGTS Access | 2 stardust | Unlock NGTS data | Higher quality exoplanet data |
| Spectroscopy | 2 stardust | Measure stellar metallicity | Enhanced planet stats |
| Find Minerals | 2 stardust | Enable AI4M mineral discovery | Terrestrial resource extraction |
| P4 Minerals | 2 stardust | Enable Planet Four minerals | Surface ice detection |
| Rover Extraction | 2 stardust | Physical mineral harvesting | Ground-based mining |
| Satellite Extraction | 2 stardust | Remote mineral analysis | Atmospheric resource extraction |

### Classification Type Reference

| Classification Type | Project Name | Structure | Anomaly Set(s) |
|-------------------|--------------|-----------|----------------|
| `planet` | Planet Hunters TESS | Telescope | `telescope-tess` |
| `planet` | Planet Hunters NGTS | Telescope | `telescope-ngts` |
| `telescope-minorPlanet` | Daily Minor Planet | Telescope | `telescope-minorPlanet` |
| `active-asteroids` | Active Asteroids | Telescope | `active-asteroids` |
| `sunspot` | Sunspot Classification | Telescope | `sunspot` |
| `DiskDetective` | Disk Detective | Telescope | `diskDetective` |
| `cloud` | Cloudspotting on Mars | Satellite | `cloudspottingOnMars` |
| `balloon-marsCloudShapes` | Mars Cloud Shapes | Satellite | `balloon-marsCloudShapes` |
| `lidar-jovianVortexHunter` | Jovian Vortex Hunters | Satellite | `lidar-jovianVortexHunter` |
| `satellite-planetFour` | Planet Four | Satellite | `satellite-planetFour` |
| `automaton-aiForMars` | AI for Mars | Rover | `automaton-aiForMars` |
| `zoodex-burrowingOwl` | Burrowing Owls | Biodome | N/A (upload) |
| `zoodex-iguanasFromAbove` | Iguanas from Above | Biodome | N/A (upload) |
| `zoodex-southCoastFaunaRecovery` | South Coast Fauna | Biodome | N/A (upload) |

---

## Summary Statistics

**Total Citizen Science Projects:** 11  
**Telescope Projects:** 4  
**Satellite Projects:** 4  
**Rover Projects:** 1  
**Biodome Projects:** 3  
**Zooniverse-Connected:** 7 (Planet Hunters, Daily Minor Planet, Disk Detective, Cloudspotting, JVH, Planet Four, AI4M)  
**Custom Implementations:** 4 (Sunspots, Burrowing Owls, Iguanas, Fauna Recovery)  
**Mineral-Generating Projects:** 4 (Cloudspotting, JVH, Planet Four, AI4M)  
**Total Mineral Types:** 15  
**Total Research Upgrades:** 9  
**Weekly Deployment Structures:** 3 (Telescope, Satellite, Rover)  
**Continuous Participation:** 1 (Sunspot)  
**Upload-Based:** 3 (All Zoodex projects)

---

## Document Metadata

**Created by:** GitHub Copilot (Claude Sonnet 4.5)  
**Source Analysis:** Complete codebase scan including:
- `/CITIZEN_SCIENCE_OVERVIEW.md`
- `/STAR_SAILORS_USER_FLOWS.md`
- Classification form configurations
- Mineral deposit creation logic
- Deployment API routes
- Anomaly discovery systems
- Research upgrade mechanics

**Verification Status:** ✅ Cross-referenced with production code  
**Last Code Scan:** February 22, 2026  
**Next Review:** When new projects are added
