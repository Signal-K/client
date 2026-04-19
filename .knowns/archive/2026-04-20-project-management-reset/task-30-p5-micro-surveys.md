---
id: task-30-p5-micro-surveys
title: "3.0 Phase 5: In-Game Micro-Survey System"
status: completed
priority: high
phase: "3.0-p5"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-15T00:00:00Z'
---

# 3.0 Phase 5: In-Game Micro-Survey System

## Goal
Replace the PostHog NPS popup with a custom micro-survey system that looks like a natural game UI element. Single questions, max 3 options, event-triggered.

## Tasks

### Component
- [x] `MechanicPulseSurvey` client component (existing, sci-fi panel styling)
- [x] Slides up from bottom, dismissable with X, auto-dismiss via `useGameSurveys`

### State & Logic
- [x] `useGameSurveys` hook: manages queue, shown state, per-survey cooldown (localStorage)
- [x] Survey config: `MECHANIC_SURVEYS` array in `mechanic-surveys.ts`
- [x] Prevent showing same survey twice (localStorage key per survey+user)
- [x] PostHog `survey sent` event fires on submit with survey ID and responses

### Survey Triggers (Phase 5 initial set)
- [x] `first_classification_submitted` → "What drew you to this project?" (trigger_first_classification_v1)
- [x] `structure_deployed` → "How did that feel?" (trigger_structure_deployed_v1)
- [x] `session_5th_classification` → "Would you try a standalone experiment?" (trigger_session_5th_classification_v1)
- [x] `return_visit_3d` → "What brings you back?" (trigger_return_visit_3d_v1)

### Integration
- [x] `GameSurveys` wired into `/game/GameClient.tsx`
- [x] NPS popup (`NPSPopup`) removed from `GameClient.tsx`

## Acceptance Criteria
- Survey slides up without layout shift
- Dismissed state persists across page reload
- Responses stored in Prisma with userId + surveyId + option + timestamp
- PostHog receives identical event for cross-referencing
- Works identically on mobile and desktop
