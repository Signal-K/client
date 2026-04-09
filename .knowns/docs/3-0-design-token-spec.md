---
title: 3.0 Design Token Spec
createdAt: '2026-04-13T03:21:30.956Z'
updatedAt: '2026-04-13T03:21:30.956Z'
description: >-
  Typography and colour tokens for the 3.0 redesign — fonts, weights, hex
  palette, spacing scale, dark/light variants. Derived from globals.css and
  tailwind.config.ts. Closes aaigmw.
tags:
  - design
  - tokens
  - '3.0'
---

# 3.0 Design Token Spec

Authoritative token reference. All values are live in the codebase — this doc
locks decisions and gives a single source of truth. Closes ticket `aaigmw`.

---

## Typography

### Typeface

**One font only: Syne Mono** (Google Fonts)

```
Weight: 400 — the only weight in this family
CSS variable: --font-syne-mono
next/font/google import: Syne_Mono
```

Applied globally in `tailwind.config.ts` — display, sans, and mono all resolve
to Syne Mono. **All text on the platform is monospaced.** This is intentional.

### Type scale

| Role | Tailwind | Size |
|------|----------|------|
| Hero display | `text-4xl` – `text-5xl` | 36–48px |
| Section heading | `text-2xl` – `text-3xl` | 24–30px |
| Card heading | `text-lg` – `text-xl` | 18–20px |
| Body | `text-sm` – `text-base` | 14–16px |
| HUD / label | `text-xs` | 12px |
| Micro label | `text-[10px]` / `text-[11px]` | 10–11px |

### Conventions

- `uppercase tracking-widest` — nav items, section labels, HUD strip labels
- `tabular-nums` — all numeric readouts (HUD, leaderboard, odometers)
- `font-bold` + colour — used to create emphasis (no separate bold typeface weight)
- Hierarchy = size + colour + spacing, not weight variants

---

## Colour Palette

### Primary (same in both modes)

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#00A1E4` | CTAs, links, active states, primary glow |
| Primary RGB | `0, 161, 228` | Opacity/glow variants via `rgba()` |

### Dark mode backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#181A1F` | Page |
| Foreground | `#D8DEE9` | Body text |
| Muted foreground | `#A3B1C8` | Labels, hints |
| Card fill | `rgba(0,0,0,0.25)` | Panels |
| Border | `rgba(0,161,228,0.15)` | Panel edges |

### Light mode backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#ECEFF4` | Page |
| Foreground | `#2E3440` | Body text |
| Muted foreground | `#4C566A` | Labels, hints |

### Secondary / accent

| Name | Hex | Role |
|------|-----|------|
| Navy | `#012F6B` | Secondary dark fills, depth layers |
| Teal | `#5FCBC3` | Accent colour (CSS `--accent`) |

### Structure accent colours

| Structure | Hex | Tailwind |
|-----------|-----|----------|
| Telescope | `#2DD4BF` | `teal-400` |
| Satellite | `#38BDF8` | `sky-400` |
| Rover | `#FCD34D` | `amber-400` |
| Solar | `#FB923C` | `orange-400` |

Used for: card borders, nav button glows, HUD icons, status LEDs. Do not mix
structure colours across structures.

### Glow shadows

```
glow-teal:  0 0 12px rgba(45,212,191,0.3),  0 0 24px rgba(45,212,191,0.1)
glow-amber: 0 0 12px rgba(251,191,36,0.3),  0 0 24px rgba(251,191,36,0.1)
glow-sky:   0 0 12px rgba(56,189,248,0.3),  0 0 24px rgba(56,189,248,0.1)
```

For icon glow: `filter: drop-shadow(0 0 3px <colour>)` at ~0.7 opacity.

---

## Spacing

Base: 4px. No custom scale — standard Tailwind.

| Context | Value |
|---------|-------|
| Mobile page padding | `px-4` – `px-6` |
| Desktop page padding | `px-8` – `px-12` |
| Card inner padding | `p-4` – `p-6` |
| Card gap | `gap-3` – `gap-4` |
| Command header height | `h-14` (56px) |
| HUD strip vertical | `py-1.5` (6px) |
| Mobile bottom nav clearance | `pb-[80px]` |

---

## Background utilities

| Class | Description |
|-------|-------------|
| `star-field` | Two-layer radial dot pattern (28px + 56px), low-opacity white |
| `sunburst-hero` | Radial primary glow from bottom edge — hero sections |
| `sunburst-lg` | Softer glow ellipse — card/section bg layer |
| `scan-line` | CRT scanline repeat at 4px intervals |
| `sci-fi-grid` | Faint primary-tinted grid |
| `sci-fi-panel` | Glass card: backdrop-blur + panel-bg + panel-border |

---

## Dark/light mode QA

- `#00A1E4` on dark `#181A1F`: ~4.6:1 — passes AA for UI elements
- `#00A1E4` on light `#ECEFF4`: ~3.2:1 — UI elements only, not body text
- `amber-300` (#FCD34D) on light bg: decorative only, not text
- `star-field` opacity: use ≤0.3 on light mode

---

## Undecided / out of scope for now

- Illustration style (none — product uses real astronomy imagery)
- Icon set additions beyond Lucide
- Motion easing tokens (Framer Motion defaults + Tailwind keyframes)

