---
id: task-30-p5-micro-surveys
title: "3.0 Phase 5: In-Game Micro-Survey System"
status: todo
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
- [ ] Create `MicroSurvey` client component
  - Slides up from bottom (like a game notification)
  - Single question + up to 3 option buttons
  - Dismissable with swipe-down or X
  - Sci-fi panel styling (glass + border glow)
  - Auto-dismisses after 15s if no interaction

### State & Logic
- [ ] `useMicroSurvey` hook: manages queue, shown state, per-survey cooldown
- [ ] Survey config: array of survey objects `{ id, trigger, question, options }`
- [ ] Prevent showing same survey twice to same user (localStorage + Prisma)
- [ ] Server Action: `submitSurveyResponse(surveyId, option)` → Prisma + PostHog

### Survey Triggers (Phase 5 initial set)
- [ ] `first_classification_submitted` → "What drew you to this project?"
- [ ] `structure_deployed` → "How did that feel?"
- [ ] `session_5th_classification` → "Would you try a standalone experiment for this?"
- [ ] `return_visit_3d` → "What brings you back?"

### Integration
- [ ] Wire into `/game/page.tsx` via `MicroSurveyProvider`
- [ ] Remove existing NPS popup (`NPSPopup` dynamic import) once replaced

## Acceptance Criteria
- Survey slides up without layout shift
- Dismissed state persists across page reload
- Responses stored in Prisma with userId + surveyId + option + timestamp
- PostHog receives identical event for cross-referencing
- Works identically on mobile and desktop
