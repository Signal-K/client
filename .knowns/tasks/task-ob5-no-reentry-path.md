---
id: task-ob5-no-reentry-path
title: "Onboarding: no re-entry context when user bounces mid-flow"
status: open
priority: medium
createdAt: '2026-04-07T00:00:00Z'
---

# Onboarding: Mid-flow bounce lands at "Station Arrival" with no context

## Status
**Status:** Open
**Priority:** Medium
**Created:** 2026-04-07

## Context
If a user reaches "project-selection" or "structure-intro" and then refreshes or navigates away,
`onboarding/page.tsx` always starts at `step = "intro"` on remount. They see "Station Arrival"
again with no memory of where they were. There is no step persistence between page loads.

The existing `preferences.projectInterests` is set only on finalise, so there's no in-progress
signal to resume from.

## Objectives
- [ ] Persist the current onboarding step (and selected project) to localStorage so the page can resume
- [ ] On mount, if `localStorage.onboarding_step` is set and `!hasCompletedOnboarding`, restore to that step and project
- [ ] Clear the persisted step when `completeOnboarding()` is called
- [ ] If user is at "structure-intro" step but has no selectedProject in storage, fall back to "project-selection"

## Strategy
- Use a key like `ss_onboarding_step` and `ss_onboarding_project` in localStorage
- Read these in the same `useEffect` block that currently initialises `showIntro`
- Don't use `useUserPreferences` for this — it's transient state that shouldn't outlive the onboarding flow
