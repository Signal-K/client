---
id: task-ob7-alpha-watermark
title: "Onboarding: remove v3.0.0-alpha version watermark from footer"
status: open
priority: low
createdAt: '2026-04-07T00:00:00Z'
---

# Onboarding: v3.0.0-alpha watermark visible in production onboarding footer

## Status
**Status:** Open
**Priority:** Low
**Created:** 2026-04-07

## Context
`src/app/onboarding/page.tsx` line 150 renders a hardcoded version string in the HUD footer:

```tsx
<span className="text-[10px] font-mono text-muted-foreground/40 uppercase">v3.0.0-alpha</span>
```

This is a hardcoded string that leaks internal versioning to new users on their very first
interaction with the product. It adds no value and signals "unfinished" at the exact moment
first impressions matter most.

## Objectives
- [ ] Remove the version span entirely from the onboarding footer

## Strategy
- Simple deletion — don't replace with anything, the footer reads fine with just the "System Online" indicator
