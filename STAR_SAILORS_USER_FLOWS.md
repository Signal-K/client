# Star Sailors: Complete User Flow & Citizen Science Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & User Onboarding](#authentication--user-onboarding)
3. [Deployment System](#deployment-system)
4. [Classification Workflows](#classification-workflows)
5. [Discovery & Research Features](#discovery--research-features)
6. [Social Features](#social-features)
7. [Annotation & Data Interaction](#annotation--data-interaction)
8. [Citizen Science Projects](#citizen-science-projects)
9. [Complete User Journey Examples](#complete-user-journey-examples)

## Overview

Star Sailors is a Next.js 14 application that gamifies citizen science through space exploration. Users deploy virtual structures, classify real astronomical and planetary data, contribute to research projects, and engage with a community of fellow citizen scientists. The application is organized around **user mechanics** rather than technical implementation, featuring six core component areas:

- **Classification**: Image/data classification mechanics
- **Deployment**: Structure & mission deployment
- **Discovery**: Exploration & data discovery
- **Research**: Scientific progression & skill trees
- **Social**: Community features & interaction
- **Profile**: User management & authentication

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

3. **Account Conversion (Optional)**:
   - At any time, users can convert to permanent account
   - **Convert Anonymous Account Component** prompts users
   - Benefits shown: multi-device access, email updates, leaderboards, permanent progress
   - Email verification process initiated

### Traditional Account Flow
**Path**: `/auth` → Email/Google signup

1. **Registration Options**:
   - Email + password registration
   - Google OAuth integration
   - Account creation via Supabase Auth

2. **Profile Setup**:
   - Automatic profile creation in database
   - Username and basic details collection
   - Avatar selection/generation

3. **Onboarding**:
   - First login redirects to main dashboard
   - Basic structures pre-deployed for immediate engagement
   - Tutorial system guides through initial classification

## Deployment System

### Telescope Deployment Flow
**Path**: `/activity/deploy` → Telescope Deployment

1. **Access Check**:
   - System verifies user authentication
   - Checks if telescope already deployed this week
   - Calculates additional deployment opportunities based on community engagement

2. **Sector Selection**:
   - **Telescope Viewport** displays star field with navigable sectors
   - D-pad controls for sector navigation
   - Visual overlay shows anomaly density per sector
   - Drag functionality for sector movement

3. **Deployment Process**:
   - User selects target sector
   - System generates seeded anomalies based on sector coordinates
   - **Anomaly Distribution**:
     - Planets (TESS catalog)
     - Asteroids (Minor planet catalog) 
     - Active asteroids (unlocked after 2+ asteroid classifications)
   - 4 anomalies randomly selected and linked to user

4. **Confirmation & Notification**:
   - Success dialog with deployment details
   - Push notification sent about new targets
   - Automatic redirect to telescope interface

### Satellite Deployment Flow  
**Path**: Main dashboard → Satellite deployment (requires classified planets)

1. **Prerequisites Check**:
   - Must have classified at least one planet
   - Planet targets list populated from user's classifications

2. **Investigation Mode Selection**:
   - **Planets**: Basic satellite deployment to classified planets
   - **Weather**: Cloud anomaly investigation (requires 2+ cloud classifications)
   - **P-4**: Wind survey missions on specific planets

3. **Deployment & Anomaly Generation**:
   - System fetches appropriate anomaly sets based on mode
   - Links 1-4 anomalies to the satellite mission
   - Creates `linked_anomalies` entries with unlock timers

4. **Mission Activation**:
   - Weekly unlock schedule for satellite data
   - Notifications sent when new data becomes available

### Structure Access Control
- **Telescopes**: Available immediately, weekly deployment limit
- **Satellites**: Requires planet classifications
- **Rovers**: Future feature (shown as "Coming Soon")
- **Balloons**: Future feature (shown as "Coming Soon")

## Classification Workflows

### Telescope Classification Flow
**Path**: `/structures/telescope` → Project selection → Classification

1. **Project Selection**:
   - **Planet Hunters**: Exoplanet transit classification
   - **Daily Minor Planet**: Asteroid movement tracking  
   - **Sunspots**: Solar activity monitoring
   - **Disk Detective**: Circumstellar disk identification

2. **Classification Interface**:
   - **Telescope Viewport** shows astronomical data/images
   - Real-time data from deployed telescope missions
   - Multiple view types: light curves, images, time series

3. **Classification Process**:
   - User selects classification options via form controls
   - **Annotation Tools** available for detailed analysis
   - Multiple choice questions specific to data type
   - Free-text commentary field

4. **Data Validation**:
   - Schema validation via Drizzle ORM
   - Configuration stored as JSONB
   - Media assets linked and stored

### Cloud Classification Flow
**Path**: Satellite data → Weather balloon interface

1. **Data Access**:
   - Unlocked through satellite deployment
   - Time-gated release of new imagery

2. **Classification Types**:
   - **Martian Clouds**: Shape and behavior analysis
   - **Jovian Vortex**: Storm pattern identification
   - **Earth Clouds**: LIDAR data interpretation

3. **Annotation Workflow**:
   - **Image Annotator** with specialized tools
   - Category-specific annotation options
   - Drawing tools for precise feature marking
   - Color coding system for different cloud types

### Planet Classification Flow
**Path**: Any telescope project with planet candidates

1. **Light Curve Analysis**:
   - Transit detection in brightness data
   - Period determination
   - Transit depth measurement

2. **Classification Options**:
   - "Repeating dips" (periodic transits)
   - "Similar size dips" (consistent transit depth)
   - "Aligned dips" (phase-locked transits)
   - "No dips" (no detectable transits)

3. **Planet Parameter Estimation**:
   - Mass estimation slider
   - Radius estimation slider  
   - Orbital period calculation
   - Planet type classification (rocky/gaseous)

## Discovery & Research Features

### Skill Tree System
**Path**: `/research/tree` → Interactive skill progression

1. **Skill Categories**:
   - **Astronomy**: Planet and asteroid classification improvements
   - **Meteorology**: Cloud and weather analysis capabilities
   - **Biology**: Life detection and analysis tools
   - **Rover Operations**: Surface exploration enhancements

2. **Progression Mechanics**:
   - Skills unlock based on classification counts
   - **Skill Tree Component** shows dependencies
   - Visual progress indicators
   - Unlock animations and notifications

3. **Benefits & Upgrades**:
   - Enhanced classification accuracy
   - Access to advanced data sets
   - New structure deployments
   - Increased classification limits

### Research Dashboard
**Path**: `/research` → Research progress overview

1. **Progress Tracking**:
   - **Total Points System** aggregates all contributions
   - Category-specific achievement counters
   - Research milestone indicators

2. **Research Sections**:
   - **Astronomy Research**: Telescope and observation improvements
   - **Meteorology Research**: Atmospheric analysis tools
   - **Rover Research**: Surface exploration capabilities
   - Each with unique upgrade paths and benefits

3. **Referral System**:
   - **Referral Code Panel** for community growth
   - Bonus rewards for successful referrals
   - Integration with point accumulation system

### Discovery Notifications
- Real-time notifications for new anomalies
- Weekly satellite data releases
- Community discovery announcements
- Research milestone achievements

## Social Features

### Activity Feed System
**Path**: Main dashboard → Recent Activity section

1. **Activity Types**:
   - **Comments on Classifications**: Community feedback
   - **Votes on Classifications**: Peer review system
   - **Recent Classifications**: Other users' contributions

2. **Community Interaction**:
   - **Commenting System**: Text-based feedback on classifications
   - **Voting System**: Upvote/downvote classification quality
   - **Activity Timeline**: Chronological feed of community actions

3. **Social Benefits**:
   - Additional deployment opportunities through community engagement
   - Recognition for helpful contributions
   - Knowledge sharing and learning

### Post & Comments Flow
**Path**: `/posts/[id]` → Individual classification discussion

1. **Classification Details**:
   - Full classification data display
   - Media assets and annotations
   - Author information and timestamp

2. **Comment Thread**:
   - Nested comment system
   - Reply functionality
   - Vote tallying and display

3. **Community Validation**:
   - Peer review process
   - Quality indicators based on votes
   - Consensus building mechanisms

### Leaderboards & Recognition
- **Classification Point System**: Quantified contributions
- **Community Rankings**: Competitive elements
- **Achievement Badges**: Milestone recognition
- **Referral Rewards**: Community growth incentives

## Annotation & Data Interaction

### Image Annotation System
**Path**: Any classification interface with image data

1. **Annotation Tools**:
   - **Drawing Tools**: Pen, circle, square annotation shapes
   - **Category System**: Project-specific annotation categories
   - **Color Coding**: Different colors for different feature types
   - **Line Width Control**: Precision adjustment

2. **Category-Specific Tools**:
   - **AI4M** (Mars terrain): Sand, rock, soil classifications
   - **P4** (Planet Four): Fan and blotch identification  
   - **JVH** (Jovian Vortex): Storm and turbulence marking
   - **CAC** (Cloudspotting): Cloud type and color coding

3. **Annotation Workflow**:
   - Select annotation tool and category
   - Draw directly on image data
   - **Legend Component** tracks annotation counts
   - Save annotated images to cloud storage
   - Submit annotations with classification

### Data Upload & Media System
1. **Media Storage**: Supabase storage integration
2. **Annotation Export**: PNG export of annotated images  
3. **Multi-Asset Support**: Multiple images per classification
4. **Cross-referencing**: Link annotations to database records

## Citizen Science Projects

### Astronomy Projects

#### Planet Hunters (Exoplanet Detection)
- **Data Source**: NASA TESS telescope light curves
- **Classification Task**: Identify periodic brightness dips indicating planetary transits
- **User Actions**:
  - Analyze light curve plots
  - Mark repeating transit events
  - Estimate planet parameters (mass, radius, period)
  - Validate candidate planets through consensus

#### Daily Minor Planet (Asteroid Tracking) 
- **Data Source**: Ground-based telescope imagery sequences
- **Classification Task**: Track moving objects across image frames
- **User Actions**:
  - Compare sequential astronomical images
  - Identify objects that move between frames
  - Mark potential asteroid trajectories
  - Distinguish from image artifacts

#### Sunspot Classification
- **Data Source**: Solar observation imagery
- **Classification Task**: Count and categorize solar sunspots
- **User Actions**:
  - Identify dark regions on solar surface
  - Count individual sunspots
  - Track sunspot evolution over time
  - Contribute to space weather monitoring

#### Disk Detective (Circumstellar Disks)
- **Data Source**: Infrared telescope observations
- **Classification Task**: Identify debris disks around stars
- **User Actions**:
  - Examine multi-wavelength star images
  - Identify extended emission beyond stellar core
  - Classify disk morphology and extent
  - Contribute to planetary system formation research

### Atmospheric Science Projects

#### Cloudspotting on Mars
- **Data Source**: Mars satellite imagery (MRO, Mars Express)
- **Classification Task**: Identify and classify Martian cloud formations
- **User Actions**:
  - Mark cloud boundaries with annotation tools
  - Classify cloud types (water ice, CO2, dust)
  - Track cloud movement and evolution
  - Contribute to Mars climate modeling

#### Jovian Vortex Hunters
- **Data Source**: Jupiter atmospheric imagery (Juno, ground-based)
- **Classification Task**: Identify and track atmospheric vortices
- **User Actions**:
  - Mark cyclonic and anticyclonic features
  - Measure vortex sizes and intensity
  - Track storm evolution over time
  - Contribute to gas giant atmospheric dynamics research

### Surface Science Projects

#### AI for Mars (Terrain Classification)
- **Data Source**: Mars rover imagery (Perseverance, Curiosity)
- **Classification Task**: Identify terrain features and rock types
- **User Actions**:
  - Classify surface materials (sand, bedrock, consolidated soil)
  - Identify geological features
  - Mark regions of interest for rover operations
  - Support autonomous rover navigation

#### Planet Four (Seasonal Changes)
- **Data Source**: Mars Reconnaissance Orbiter seasonal imagery
- **Classification Task**: Track seasonal surface changes
- **User Actions**:
  - Identify fans and dark spots from seasonal processes
  - Mark blotches indicating subsurface activity
  - Track seasonal evolution patterns
  - Contribute to Mars seasonal dynamics understanding

### Biology Projects

#### Wildlife Monitoring (Burrowing Owls)
- **Data Source**: Wildlife camera imagery
- **Classification Task**: Count and identify owl behaviors
- **User Actions**:
  - Count individual owls in images
  - Classify age groups (adult/juvenile)
  - Identify behavioral activities
  - Contribute to conservation monitoring

## Complete User Journey Examples

### New User Journey: From Registration to First Discovery

1. **Initial Registration** (Anonymous Quick Start)
   - Visit `/auth` → Click "Continue as Guest"
   - Automatic profile creation and telescope pre-deployment
   - Welcome tutorial begins

2. **First Classification**
   - Navigate to `/structures/telescope`
   - Access pre-deployed planet candidates
   - Use telescope viewport to analyze first light curve
   - Submit classification with guided assistance

3. **Community Engagement**
   - View other users' classifications in activity feed
   - Add first comment on community classification
   - Receive notification about satellite deployment opportunity

4. **Structure Deployment**
   - Deploy satellite to first classified planet
   - Receive confirmation and mission timeline
   - Set up notifications for satellite data releases

5. **Research Progression**
   - Visit `/research` to view skill tree
   - Unlock first astronomy skill after 3 classifications
   - Access enhanced telescope capabilities

6. **Account Conversion**
   - Convert anonymous account to permanent
   - Add email for notifications and multi-device access
   - Join community leaderboard

### Advanced User Journey: Multi-Project Engagement

1. **Weekly Planning**
   - Check `/research` dashboard for week's goals
   - Plan telescope deployment for new sector
   - Review satellite mission schedules

2. **Cross-Project Classification**
   - Morning: Planet hunter light curve analysis
   - Afternoon: Mars cloud classification from satellite data
   - Evening: Asteroid tracking in daily minor planet project

3. **Community Leadership**
   - Mentor new users through comment system
   - Share expertise in specialized classification types
   - Participate in consensus building for difficult cases

4. **Research Contribution**
   - Achieve classification milestones in multiple disciplines
   - Unlock advanced annotation tools
   - Contribute to real research publications through data quality

### Research Impact Journey: From Citizen to Scientist

1. **Skill Specialization**
   - Focus on specific project type (e.g., exoplanets)
   - Master advanced classification techniques
   - Achieve high accuracy ratings from community validation

2. **Data Quality Leadership**
   - Classifications regularly achieve consensus validation
   - Contribute to "gold standard" training datasets
   - Mentor other users in classification best practices

3. **Scientific Publication**
   - Data contributions included in peer-reviewed research
   - Recognition in research acknowledgments
   - Direct collaboration with professional astronomers

4. **Community Building**
   - Recruit new users through referral system
   - Organize classification drives for important datasets
   - Bridge citizen science community with professional research

## Technical Implementation Notes

### Database Schema Key Points
- **Profiles**: User accounts with classification points and push subscriptions
- **Anomalies**: Research data entries with configuration metadata
- **Classifications**: User contributions with JSONB configuration storage
- **Comments**: Community interaction and feedback system
- **Linked Anomalies**: Deployed missions connecting users to specific datasets
- **Researched**: Skill tree progression tracking

### Authentication System
- Supabase Auth with anonymous and traditional account support
- Session management across client components
- Profile creation automation and validation

### Real-time Features
- Push notifications for new data releases
- Live activity feeds for community engagement
- Real-time classification updates and feedback

### Data Storage Architecture
- **Supabase Storage**: Media assets and annotation images
- **PostgreSQL**: Structured data with JSONB for flexible configuration
- **CDN Integration**: Optimized image and asset delivery

This comprehensive documentation captures the full scope of Star Sailors' citizen science platform, from initial user onboarding through advanced research contribution, demonstrating how gamification mechanics enhance scientific discovery and community engagement.
