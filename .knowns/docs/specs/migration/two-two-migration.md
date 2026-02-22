---
title: "Experiment 1 Full Spec"
---

### Def
The goals:
1. Unify all #Experiments that are live with the web client (available at https://starsailors.space)
2. Interactive surveys, processed by #posthog, that 1) identify users (email, supabase uuids, etc); 2) identify areas for improvement, focus, what works, etc - for everything (see below for more context about surveys)
3. The home page of the `client` repo should clearly describe the user flow and experience for each project/part of the ecosystem and point users towards the frontend that would best suit them (e.g. the main webapp is very text-based and there's not a huge amount of gamification, but #experiment1 only has 3 projects included). 

All posthog surveys will likely need to be updated; I want you to take the answers from all current surveys and identify changes that would need to be made per-project; and maybe new surveys will need to be created for different parts.
Rewards will be given to users for participating in surveys, I'm open to how this would be done.

4. All tests, for all projects, need to pass. User flows that don't make sense, or UI elements that may be confusing or non-responsive will need to be overhauled. Right now, since this spec sheet is part of the `client` repo, just focus on the webapp here.
5. Users need to be notified when things occur; if they've installed the PWA, by push notifications. I don't want to use a service like OneSignal or Twilio for this, I want to do this with cookies, possibly github actions for when there are "community events" - see the workflow files for some attempts I've previously made for this. You have full autonomy over this.

### Ecosystem
1. Web client - frontend
2. #PlanetHunters-Experiment1 - a small clone of "Tiny Space Program", centred on the #PLanetHunters citizen science project, as well as #DailyMinorPlanet and #ActiveAsteroids . Users create rockets, fly them to targets, go mining, and then
3. #Click-A-Coral  - a small puzzle game where users breed fish to produce coral; related to the ClickACoral Citizen Science project available on #Zooniverse. NOTE: this game is currently in the early stage of development and is not ready for playtesting - YET.
4. #Saily - a little experiment to create something like the New York Times' Wordle/daily puzzles. See full spec sheet below

# Experiment 1 Full Spec

Planet Hunters is a hybrid resource management game and citizen science platform where players explore the solar system and beyond, conducting mining missions to real astronomical targets while contributing to actual scientific discovery. The core gameplay loop interweaves economic progression with authentic data from space telescopes, creating an experience where entertainment and scientific contribution are inseparable. Players scan the cosmos using real TESS (Transiting Exoplanet Survey Satellite) telescope data and asteroid databases, select targets for resource extraction missions, and analyze celestial objects—activities that mirror real astronomical research workflows and can generate scientifically valuable classifications.

##### Core User Flow & Citizen Science Touchpoints
The primary gameplay cycle begins at **Earth Base**, the player's planetary headquarters featuring three key structures: the **Satellite Station** (scanner/telescope), **Control Station** (mission command), and **Launchpad** (launch facility). Players initiate missions by visiting the Satellite Station to scan space for targets. This scanning process pulls real astronomical data from Supabase databases, including active asteroids and exoplanet candidates from the TESS telescope mission—the same data professional astronomers and citizen scientists use in real discovery programs. When scanning, players see authentic light curve data, object identifiers (TIC IDs for TESS objects), and positional information, presented through an in-game interface that abstracts the complexity while preserving scientific authenticity.

Once scan results arrive, players can **view detailed information** about each celestial object, including distance (measured in Astronomical Units), object type (asteroid or exoplanet candidate), and visual data representations. The planned **annotation and classification system** enables players to mark interesting features on light curves or asteroid images, categorize anomalies, and flag objects for further review—activities that directly parallel Zooniverse-style citizen science projects like Planet Hunters TESS. These contributions can be saved locally and, in future iterations, uploaded to contribute to real scientific databases. Players who prefer purely goal-driven gameplay can toggle off the citizen science narrative explanations, while those interested in the research context receive educational overlays explaining how their in-game actions relate to actual astronomical discovery.

After selecting a target, players transition to the **Mission Planning** phase at the Launchpad, where they configure their rocket (unlocking more capable spacecraft as they level up), review mission parameters including distance and estimated resource yield, and commit resources (Francs, the in-game currency) to launch. Missions progress through **Transit**, **Mining/Scanning**, and **Return** phases, simulating realistic timeframes for interplanetary travel. During mining operations at asteroids or data collection at exoplanet targets, players maximize resource extraction through timing-based mechanics while the game tracks their scan contributions in the background. Upon return to Earth, the **Mission Debrief** screen presents mining yields, experience gained (awarded for both launches and scans, reinforcing the dual gameplay/science loop), and options to sell cargo, salvage rocket components, or archive the mission's scientific data.

## Citizen Science Mechanics & Planned Scope
The **Satellite Station** serves as the primary citizen science hub, where telescope scanning is framed not just as target acquisition but as meaningful participation in astronomical surveys. The game sources real anomaly data—unusual asteroids, potential exoplanet transits, and other celestial phenomena—from public astronomical databases via Supabase integration. When players examine these objects in detail, they encounter the same visual patterns researchers analyze: dips in stellar brightness curves indicating potential planets, irregular asteroid rotation signatures, or anomalous spectral features. The planned classification workflow allows players to mark these features, submit binary or multi-choice classifications (e.g., "Does this show a transit signal?"), and optionally provide free-text observations—all mechanics borrowed from successful citizen science platforms.

  

A key design consideration is **optional engagement**: players can treat scanning purely as a resource-gathering mechanic (finding profitable mining targets) or dive deep into the scientific layer by reading contextual explanations, comparing multiple light curves, and thoughtfully classifying objects. Tutorial flows gently introduce the classification interface during early missions, while a toggleable "science dialogue mode" provides richer explanations for engaged players without interrupting those focused on economic optimization. Experience points are awarded for both launching missions (XP_AWARD_LAUNCH) and completing scans (XP_AWARD_SCAN), mechanically equalizing science and mining activities to encourage exploration of both systems.

  

The backend architecture supports future expansion: annotated images and classifications are currently stored locally in a standardized format (`user://annotations/`) with plans to sync to Supabase tables mirroring Zooniverse data schemas. The normalization of anomaly IDs (preferring numeric TIC identifiers) and migration systems ensure compatibility with external datasets, positioning the game to eventually contribute aggregated player classifications back to the astronomical community. Mission-gated progression (e.g., planet scanning unlocks at Level 2, advanced contractors appear at higher levels) introduces increasingly complex celestial phenomena as players build expertise, naturally scaffolding scientific literacy. The ultimate vision is a feedback loop where player contributions inform real research, research discoveries unlock new in-game content, and the boundary between gaming and scientific participation becomes productively blurred—a model where millions of casual players collectively perform computational and pattern-recognition tasks that complement professional astronomy while enjoying a compelling strategy game.



# Saily specs
## Overview

Planet Hunters is a citizen science gaming platform built on top of Next.js and Supabase that combines daily puzzle-game mechanics with real scientific research. Players participate in real astronomical discovery by analyzing light curve data from the TESS (Transiting Exoplanet Survey Satellite) telescope to identify potential exoplanet candidates (anomalies).

The platform gamifies citizen science through:
- **Daily anomaly discovery challenges** - Fresh TESS light curve data every day
- **Structured submission workflow** - Players annotate and submit scientific findings
- **Community engagement** - Forums, discussions, and player profiles
- **Progression system** - Scores, badges, streaks, and leaderboards

## Requirements

### Functional Requirements

#### FR-1: Daily Anomaly Discovery Gameplay
- Players receive a fresh TESS light curve (lightcurve data point visualization) each day
- Each anomaly shows normalized flux values plotted over phase/time coordinates
- Players can interact with the visualization to:
  - Zoom/pan the lightcurve display
  - Toggle phase-fold and binning transformations
  - View metadata (TIC ID, source mission, sector information)
- One anomaly per day, same for all players (seeded by game date)

#### FR-2: Anomaly Annotation System
- Players mark interesting features on the lightcurve by creating annotations
- Each annotation captures:
  - Position range (xStart, xEnd as 0-1 normalized coordinates)
  - Confidence level (0-100)
  - Tag/classification (e.g., "planet", "transit", "stellar variation", "noise")
  - Optional note (up to 2000 characters) for scientific reasoning
  - Coordinate mode (time vs phase-folded)
  - Source period (for phase-folded annotations)
- Multiple annotations per submission allowed
- Annotations saved locally before submission for draft support

#### FR-3: Anomaly Submission Workflow
- Players submit one annotation set per daily anomaly (unique per user/game_date/anomaly_id)
- Submission includes:
  - All annotations with coordinates, confidence, tags, notes
  - Optional hint flags (phaseFold used, binning applied)
  - Reward multiplier calculation based on hint usage
- Submissions enter "pending_admin_review" status
- Status transitions: pending_admin_review → reviewed → accepted/rejected
- Admin decision recorded with reviewer ID and timestamp
- Players can edit/delete pending submissions before review

#### FR-4: User Progression System
- **Scoring**: Points awarded for accurate anomaly identification
  - Base points per correct submission
  - Bonus multiplier when hints not used (encourages independent discovery)
  - Penalty multiplier when using hints (phase-fold, bin transformations)
- **Daily Play Tracking**: Captures attempts, score, win status per game_date
- **Streak System**: Current streak and best streak (consecutive daily plays)
- **Badges**: Achievement system for milestones (first submission, 10 correct, 100 correct, etc.)
- **Stats Dashboard**: Games played, wins, current/best streak, total score visible on profile

#### FR-5: Community Forum & Discussion
- **Forum Threads**: Topic-based discussion labeled by game_date
- **Comments**: Players discuss strategies, findings, and astronomical concepts
- **Thread Management**: Create, view, and filter threads by date
- **User Mentions**: Reference other players in discussions (@username)
- **Comment Timestamps**: Track when discussions occurred

#### FR-6: User Profiles & Social Features
- **Profile Display**: Username, avatar, stats summary, recent badges
- **User Following**: Players can follow peers to see their activity
- **Profile Statistics**: Display games played, wins, current streak, best streak, total score
- **Recent Badges**: Show latest earned badges on profile
- **Recent Plays**: Display recent game attempts with dates and scores

#### FR-7: Authentication & Authorization
- OAuth-based sign-in (integration with external auth provider)
- Email-based sign-in as fallback
- User profiles linked to auth identities
- Row-level security (RLS) ensures:
  - Users can only see their own submissions until admin review
  - Users can only edit pending submissions they created
  - Admins can view/edit all submissions for review

#### FR-8: Search & Discovery
- Search across anomalies by TIC ID or content
- Filter results by game date, anomaly type
- Pagination for large result sets
- Search results show lightcurve preview and metadata

#### FR-9: Offline Support
- Service worker for offline page display
- Offline page indicates connectivity status
- Graceful degradation for network-dependent features
- Cache strategy for periodic content refresh

#### FR-10: Responsive Design
- Mobile-first approach for phone/tablet play
- Calendar-style navigation for finding past games
- Touch-optimized annotation interface on mobile devices
- Adaptive UI for different screen sizes

### Non-Functional Requirements

#### NFR-1: Data Integrity
- Unique constraint on (user_id, game_date, anomaly_id) for submissions
- Foreign key relationships prevent orphaned records
- Timestamptz for UTC time consistency across timezones

#### NFR-2: Performance
- Lazy-load lightcurve data visualization
- Indexed queries on game_date, status, user_id for fast retrieval
- Pagination for forum threads and search results
- Efficient lightcurve rendering (320 points typical)

#### NFR-3: Security
- RLS policies prevent unauthorized data access
- Admin review process validates scientific submissions
- Rate limiting on API endpoints to prevent abuse
- Input validation on annotation coordinates (0-1 range), confidence (0-100)

#### NFR-4: Scalability
- Database schema designed for high-volume submission queuing
- Async admin review workflow (eventual consistency acceptable)
- Archive old anomalies/discussions for performance
- CDN delivery of lightcurve assets and images

#### NFR-5: User Experience
- Immediate visual feedback on annotation creation
- Real-time comment count updates on threads
- Smooth animations for state transitions
- Clear indicator of pending vs. reviewed submissions

## Acceptance Criteria

- [ ] AC-1: Players can view daily TESS lightcurve anomaly with metadata
- [ ] AC-2: Players can create multiple annotations per anomaly with tags, confidence, notes
- [ ] AC-3: Players can submit annotations and receive status confirmation
- [ ] AC-4: Admins can review pending submissions and approve/reject with decision notes
- [ ] AC-5: Players see score, streak, badge progress on profile
- [ ] AC-6: Players can create forum threads and post comments on game dates
- [ ] AC-7: Players can follow other users and view their profiles
- [ ] AC-8: Search returns relevant anomalies filtered by date and type
- [ ] AC-9: Offline page displays when network unavailable
- [ ] AC-10: All forms validate input constraints (coordinates 0-1, confidence 0-100)
- [ ] AC-11: RLS policies prevent users from viewing others' data
- [ ] AC-12: Admin review workflow transitions submissions through status pipeline
- [ ] AC-13: Lightcurves render correctly for both real and synthetic data
- [ ] AC-14: User signup and login flow completes successfully
- [ ] AC-15: Mobile UI elements remain responsive and touch-friendly

## User Scenarios

### Scenario 1: First-Time Player - Daily Challenge [Happy Path]
**Given** new user signs up and completes authentication
**When** user navigates to today's game
**Then** they see a fresh TESS lightcurve for today's date with:
  - Labeled axes and legend
  - TIC ID and source metadata
  - Interactive zoom/pan controls
  - Phase-fold and bin transform buttons
**And** they can create text annotations marking regions they think contain anomalies
**And** they submit annotations with confidence levels and reasoning
**And** they see score immediately and feedback on their submission

### Scenario 2: Expert Player - Using Hints [Standard Path]
**Given** returning player has played 50+ games
**When** they open today's anomaly
**Then** they can toggle advanced viewing modes (phase-fold, binning)
**And** they use hints to transform the lightcurve view
**And** they annotate features in phase-folded coordinate system
**And** they submit with hint flags recorded
**And** their score reflects hint penalty (vs. players who found it without hints)

### Scenario 3: Scientific Discussion [Community Path]
**Given** player completes today's challenge and scores well
**When** they navigate to Discuss section
**Then** they can view thread for today's game_date
**And** they read comments from other players discussing the anomaly
**And** they post their own analysis mentioning @other_player
**And** their comment appears with timestamp and username

### Scenario 4: Admin Validates Submission [Review Path]
**Given** submissions have been pending for 24 hours
**When** admin loads submission review dashboard
**Then** they see list of submissions in pending_admin_review status
**And** they click to view player's annotations overlaid on lightcurve
**And** they enter decision (accepted/rejected) with scientific reasoning
**And** system records review timestamp, reviewer, and decision
**And** player receives notification their submission was reviewed

### Scenario 5: Profile & Achievement [Progression Path]
**Given** player has played 20 games with 15 wins
**When** they open their profile
**Then** they see stats (20 games, 15 wins, 12 current streak, 18 best streak)
**And** earned badges for (10-game winner, 100-point scorer, week streak)
**And** recently earned badges displayed prominently
**And** other players can follow them and see their recent plays

### Scenario 6: Search Past Game [Discovery Path]
**Given** player remembers an interesting anomaly from 2 months ago
**When** they use search bar
**Then** they can search by TIC ID or approximate date
**And** results show past anomalies with lightcurve preview
**And** they can replay old games to re-examine them

### Scenario 7: Mobile Gameplay [Mobile Path]
**Given** mobile user opens Planet Hunters on phone
**When** they navigate to today's game
**Then** lightcurve and controls adapt to portrait orientation
**And** annotation touch interactions work smoothly (tap to create, drag to adjust)
**And** calendar navigation allows swiping between dates
**And** forms stack vertically with large touch targets

### Scenario 8: Network Connectivity [Offline Path]
**Given** user loses internet connection mid-session
**When** they try to submit annotations
**Then** they see offline page
**And** saved annotations kept in LocalStorage
**And** when connectivity restored, they can retry submission
**And** service worker caches core pages for offline viewing

## Technical Notes

### Database Schema Highlights
- **anomalies**: Light curve data (id, content, ticId, anomalyType, anomalySet, anomalyConfiguration)
- **daily_plays**: Game session tracking (game_date, won, score, attempts, played_at)
- **anomaly_submissions**: User discoveries (annotations, note, status, admin_decision, reviewed_at)
- **user_stats**: Aggregate stats (games_played, wins, current_streak, best_streak, total_score)
- **user_badges**: Achievement tracking (awarded_at, badge metadata)
- **forum_threads**: Topic discussions (title, game_date, created_by)
- **comments**: Forum replies (body, created_at, comment_thread_id)
- **user_follows**: Social relationships (user_id, follows_id)
- **profiles**: User identity (username, avatar, email)

### API Endpoints
- `POST /api/anomaly/submit` - Submit annotations for daily anomaly
- `GET /api/anomaly/[date]` - Fetch today's (or specified date) anomaly
- `GET /api/anomaly/submit/[id]` - Retrieve submission status
- `GET /api/game/today` - Game metadata and stats
- `POST /api/comments` - Create forum comment
- `GET /api/forum/[date]` - Fetch thread comments by date
- `POST /api/follows` - Follow a user
- `GET /api/search` - Search anomalies/TIC IDs
- `GET /api/admin/anomaly-submissions` - Admin review queue

### Coordinate Systems
- **Time coordinates**: 0-1 normalized across observation duration
- **Phase-folded coordinates**: 0-1 period (when using phase-fold transform with periodDays)
- Synthetic lightcurves generated deterministically by TIC ID seed (enables fair daily game)

### Reward Multiplier Logic
- Base: 100 points for correct anonymous anomaly finding
- Without hints: +25% bonus
- With hints (-25% penalty): Standard points
- Streak bonus: +10 points per consecutive day played
- Badge rewards: 500-1000 points per achievement

### Synthetic Data Generation
- Deterministic per TIC ID (same ID always generates same curve shape)
- 3 transit-like dips added to baseline flux with noise
- Realistic TESS noise characteristics modeled
- Used when real data unavailable (maintains consistent game supply)

## Open Questions
- [ ] What is the scientific accuracy threshold for accepting submissions? How is "correct" defined?
- [ ] What is the admin review SLA? Should reviews happen within X hours?
- [ ] Should leaderboards be global, weekly, or both?
- [ ] How should duplicate/very-similar submissions from different users be handled?
- [ ] Should players earn bonus points if their submission leads to actual exoplanet confirmation?
- [ ] What is the retention strategy for old games/submissions? Archive after 1 year?
- [ ] Should there be "expert" vs "beginner" difficulty levels or always mixed?
- [ ] How should the scientific community (astronomers) review and validate player discoveries?
- [ ] What happens if a player marks false positives repeatedly? Reputation penalty?
- [ ] Should community voting on submission quality supplement admin review?

## Implementation Priority

**Phase 1 (MVP)**: Core gameplay
- Daily anomaly display with lightcurve rendering
- Basic annotation system (mark region + confidence)
- Submission workflow with pending status
- User stats tracking (games played, wins)

**Phase 2**: Community & Discovery
- Forum threads and comments
- User profiles with stats
- Follow system
- Search by TIC ID

**Phase 3**: Advanced Features
- Hint system (phase-fold, binning transforms)
- Badge/achievement system
- Offline support
- Admin review dashboard

**Phase 4**: Polish & Scale
- Performance optimization
- Mobile UX refinement
- Analytics integration
- Leaderboard rankings


