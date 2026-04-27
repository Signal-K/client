---
id: 7kznko
title: Sketch the 3.0 homepage hero section
status: done
priority: medium
labels:
  - sketch
  - design
createdAt: '2026-03-26T02:31:50.403Z'
updatedAt: '2026-03-26T09:18:05.246Z'
timeSpent: 0
---
# Sketch the 3.0 homepage hero section

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The 3.0 redesign needs a hero section sketch. What's the headline, visual treatment, and primary CTA? How does it communicate the platform's purpose?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Hero section sketch complete
- [ ] #2 Headline direction and CTA identified
<!-- AC:END -->

## Hero Section Sketch

### Layout (mobile-first, single column → two-column on lg)

```
┌─────────────────────────────────────────────────────┐
│  [NAV: Logo left · "Sign in" right]                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ░░ star-field + sunburst-hero (primary glow)  ░░   │
│                                                     │
│  ┌─────────────────────────────┐                   │
│  │  01 / REAL ASTRONOMY        │  ← micro label    │
│  │                             │                   │
│  │  [HEADLINE — 2–3 lines]     │  ← text-4xl/5xl  │
│  │                             │                   │
│  │  [Subhead — 1 line]         │  ← text-base      │
│  │                             │                   │
│  │  [CTA button]  [secondary]  │                   │
│  └─────────────────────────────┘                   │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Live stat: X classifications · Y users       │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ── SCROLL ── ↓ Three product cards (01/02/03) ──   │
└─────────────────────────────────────────────────────┘
```

### Visual treatment

- **Background**: `bg-background` + `star-field` at 20% opacity + `sunburst-hero` (primary blue
  glow rising from bottom of hero block)
- **Headline text**: Syne Mono, `text-4xl md:text-5xl`, white/foreground, no gradient treatment
  — the glow is in the background, not the text
- **CTA button**: `bg-primary text-white` with `btn-glow` shadow, label "Launch Station"
- **Secondary action**: ghost button, "See how it works" → scrolls to product cards
- **Live stat strip**: single row, `font-mono text-xs text-muted-foreground`, pulls from
  Prisma-backed live stats (already implemented, task-30-p7)
- **Scan-line overlay**: very low opacity (0.04) over entire hero for texture

### Primary CTA

**"Launch Station"** → `/auth` (logs in or creates account)

The CTA is about entering the game, not "learning more." Users who want to understand first
scroll down to the three product cards.

### What the hero must communicate (in order)

1. This is a game
2. The science is real
3. You can start now

### Headline direction → see task u6zo6x for final copy options

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
kanban: f7k41f
<!-- SECTION:NOTES:END -->

