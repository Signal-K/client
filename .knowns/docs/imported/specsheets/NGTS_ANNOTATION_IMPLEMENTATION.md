---
title: "NGTS Annotation System Implementation"
---

# NGTS Annotation System Implementation

## Overview
This document details the implementation of the NGTS (Next-Generation Transit Survey) annotation system for planet candidate classification in the Star Sailors project.

## Features Implemented

### 1. NGTS Annotation Categories
**File**: `/types/Annotation.tsx`

Added a new annotation type `NGTSCategory` with two options:
- **Yes**: "Both green and magenta points cover most of the middle portion of the plot"
- **No**: "The green and magenta points do NOT cover most of the middle portion"

These categories answer the critical "Odd Even Transit Check" question that helps users determine if a planet candidate is real or a false positive.

```typescript
export type NGTSCategory = 'Yes' | 'No';
export const NGTSCATEGORIES: Record<NGTSCategory, CategoryConfig> = {
  Yes: {
    name: 'Yes',
    color: '#4CAF50',
    description: 'Both green and magenta points cover most of the middle portion of the plot'
  },
  No: {
    name: 'No',
    color: '#F44336',
    description: 'The green and magenta points do NOT cover most of the middle portion'
  },
};
```

### 2. NGTS Tutorial Component
**File**: `/src/components/projects/Telescopes/NGTSTutorial.tsx`

Created a comprehensive 6-slide tutorial that covers:
1. Introduction to NGTS and its purpose
2. Understanding transit plots and light curves
3. The Odd Even Transit Check diagnostic
4. What to look for in the data
5. How to draw the transit shape
6. Tips for successful classification

The tutorial uses:
- Smooth slide transitions with ChevronLeft/ChevronRight icons
- Progress indicators (dots)
- Visual examples with placeholder images
- Close button (X) for dismissal
- "Start Classifying" button on final slide

### 3. Annotation System Integration
**Files Modified**:
- `/src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx`
- `/src/components/projects/(classifications)/Annotating/AnnotatorView.tsx`

**Changes**:
- Added `"NGTS"` to the `annotationType` union type
- Imported `NGTSCategory` and `NGTSCATEGORIES`
- Updated `CATEGORY_CONFIG` to include NGTS categories
- Added visual header banner in AnnotatorView with instructions:
  - Purple/indigo gradient background
  - Telescope emoji (🔭)
  - Title: "NGTS Odd Even Transit Check"
  - Subtitle: "Answer the question about green and magenta points, then draw the shape of the main transit curve"

### 4. Telescope Classification Updates
**File**: `/src/components/projects/Telescopes/Transiting.tsx`

**Changes**:
- Imported `NGTSTutorial` component
- Added state variables:
  - `showNGTSTutorial`: Controls NGTS tutorial modal visibility
  - `isNGTSAnomaly`: Boolean flag to detect NGTS anomalies
- Added NGTS detection logic in `useEffect`:
  ```typescript
  const isNGTS = anomaly.anomalySet?.includes('telescope-ngts') || 
                 anomaly.anomalySet?.includes('telescope-planetHunters-ngts');
  setIsNGTSAnomaly(isNGTS);
  ```
- Added "View NGTS Tutorial" button in the top button bar (only visible for NGTS anomalies):
  - Purple border and text styling
  - Opens the NGTS tutorial modal
- Updated `ImageAnnotator` to use `annotationType={isNGTSAnomaly ? "NGTS" : "PH"}`
  - Automatically switches to NGTS annotation mode for NGTS anomalies
  - Uses standard Planet Hunters (PH) mode for other anomalies

## User Flow

### For NGTS Anomalies:
1. User navigates to planet classification for an NGTS anomaly
2. System detects the anomaly is from `telescope-ngts` or `telescope-planetHunters-ngts` sets
3. Additional "View NGTS Tutorial" button appears in purple/indigo styling
4. User can click to view the 6-slide NGTS tutorial
5. Annotation interface shows:
   - Purple banner with instructions about Odd Even Transit Check
   - Two category options: Yes/No for the transit check question
   - Drawing tools to trace the main transit curve
6. User selects Yes/No and draws the curve shape
7. Submission saves classification with NGTS-specific data

### For Standard Planet Hunters:
- Standard PH annotation categories (Noise, Clear dip, Missing, Custom)
- No NGTS tutorial button
- No NGTS instruction banner

## Technical Details

### Anomaly Detection
The system identifies NGTS anomalies by checking the `anomalySet` field:
- `telescope-ngts`
- `telescope-planetHunters-ngts`

### Category Configuration
The annotation system uses a dynamic category configuration system that automatically:
- Renders the correct categories based on `annotationType`
- Applies proper colors (Yes: green #4CAF50, No: red #F44336)
- Shows descriptions in the Legend component
- Tracks category counts

### Drawing System
Users can:
- Select Yes or No for the Odd Even Transit Check
- Use the freehand drawing tool to trace the main transit curve
- Submit both the answer and drawing as a classification

## Files Modified

1. `/types/Annotation.tsx` - Added NGTS categories
2. `/src/components/projects/Telescopes/NGTSTutorial.tsx` - New tutorial component
3. `/src/components/projects/Telescopes/Transiting.tsx` - NGTS detection and UI
4. `/src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx` - NGTS annotation support
5. `/src/components/projects/(classifications)/Annotating/AnnotatorView.tsx` - NGTS instruction banner

## Testing Checklist

- [ ] Upload NGTS anomalies using `upload_ngts.py` script
- [ ] Navigate to NGTS planet classification page
- [ ] Verify "View NGTS Tutorial" button appears (purple styling)
- [ ] Click tutorial button and verify all 6 slides display correctly
- [ ] Verify NGTS instruction banner shows above annotation canvas
- [ ] Verify Yes/No category options appear in Legend
- [ ] Select a category and draw on the transit curve
- [ ] Submit classification and verify it saves with NGTS data
- [ ] Verify non-NGTS anomalies don't show NGTS-specific UI elements

## Future Enhancements

Potential improvements:
1. Add actual NGTS lightcurve images to tutorial slides
2. Implement guided overlay showing where to draw the curve
3. Add validation to ensure user draws a curve before submitting
4. Show examples of good vs bad Odd Even Transit alignments
5. Add statistics dashboard for NGTS classifications

## Related Documentation

- See `NGTS_UPLOAD_README.md` for information on uploading NGTS data
- See research panel documentation for NGTS unlock requirements
- See telescope actions documentation for NGTS data fetching
