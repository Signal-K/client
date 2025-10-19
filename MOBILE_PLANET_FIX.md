# Mobile Planet Survey UI Improvements

## Issues:
1. Desktop lightcurve image too small (180px)
2. Mobile has overlapping 2-column layout
3. Cards too cramped, text unreadable

## Solution:
Desktop: Increase lightcurve to 340px and widen first card to 400px
Mobile: Need complete redesign - single vertical column with proper spacing

## Changes needed in PlanetMission.tsx:

### Desktop (line ~692-705):
- Change maxWidth from 180 to 340
- Add click handler to open image
- Add "Click to enlarge" text
- Change card width/positioning for i===0: width: 400, left offset: -200px

### Mobile (lines 70-522):
- Replace 3-column layout (left cards | progress bar | right cards)
- With single-column vertical list
- Show all steps in order with proper spacing
- Hide progress bar/satellite visual on mobile
- Make cards full-width with padding
- Larger touch targets for inputs
