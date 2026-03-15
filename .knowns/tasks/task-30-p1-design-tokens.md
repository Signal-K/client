---
id: task-30-p1-design-tokens
title: "3.0 Phase 1: Design Tokens, Fonts & Theme"
status: in-progress
priority: high
phase: "3.0-p1"
specRefs:
  - "specs/redesign/3-0-unified-web-client"
createdAt: '2026-03-15T00:00:00Z'
updatedAt: '2026-03-15T00:00:00Z'
---

# 3.0 Phase 1: Design Tokens, Fonts & Theme

## Goal
Establish the visual foundation for the 3.0 redesign. All subsequent phases depend on these tokens being in place first.

## Tasks
- [x] Add Nunito as the display/heading font via `next/font/google` — added to `layout.tsx`, variable passed to `RootLayoutClient`
- [x] Update `tailwind.config.ts` with animation keyframes: `orbit`, `star-twinkle`, `pulse-glow`, `fade-up`, `slide-up`, `float`, `number-count`
- [x] Add `--font-display` CSS variable and apply to heading elements in globals.css
- [x] Add `sunburst-lg`, `sunburst-hero`, `star-pattern-dense` background utilities
- [x] Add `glow-teal`, `glow-amber`, `glow-sky`, `panel`, `panel-hover` box-shadow utilities
- [x] Add `sci-fi-panel` component class (glass + border + backdrop-blur)
- [x] Add `star-field`, `sunburst-bg`, `btn-glow`, `survey-panel` component classes
- [x] Add `scan-line` background utility
- [ ] Verify dark/light mode tokens look good visually (manual QA pass)

## Acceptance Criteria
- Nunito renders for all headings in both modes
- Star textures visible on dark background, subtle on light
- New animation tokens usable via `animate-orbit`, `animate-twinkle`, etc.
- No visual regression on existing pages
