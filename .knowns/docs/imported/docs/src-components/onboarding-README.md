---
title: "Onboarding Components"
---

# Onboarding Components

This directory contains components for new user onboarding, project selection, and tutorials.

## Overview

The onboarding system consists of several interconnected components:

1. **ProjectPreferencesModal** - Asks users what projects they're interested in
2. **StructureExplainer** - Explains what each structure does and how it connects to real science
3. **InteractiveTutorial** - Step-by-step guided tour of the app
4. **ProjectSelectionViewport** - Quick project selection for new users

## ProjectPreferencesModal

A dialog that asks users to select which projects interest them most. Selections are saved to localStorage and used to customize the dashboard.

### Features

- **6 Project Types** with detailed descriptions
- **Expandable cards** with "Learn more" options
- **Multi-select** with visual feedback
- **Persistent storage** via `useUserPreferences` hook

### Usage

```tsx
import ProjectPreferencesModal from '@/src/components/onboarding/ProjectPreferencesModal';
import { ProjectType } from '@/src/hooks/useUserPreferences';

<ProjectPreferencesModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={(interests: ProjectType[]) => {
    // Handle save
  }}
  initialInterests={[]}
/>
```

## StructureExplainer

Explains what each structure (Telescope, Satellite, Rover, Solar) does and why it matters for science.

### Features

- **Detailed explanations** of each structure
- **"What can you do here?"** list of activities
- **Fun facts** about real science
- **Mineral connection** explanation (for Rover)
- **Carousel mode** for viewing all structures

### Usage

```tsx
import StructureExplainer from '@/src/components/onboarding/StructureExplainer';

// Single structure
<StructureExplainer
  structureId="telescope"
  onClose={() => setShowExplainer(false)}
/>

// All structures in carousel
<StructureExplainer
  showAll
  onComplete={() => markAsComplete()}
/>
```

## InteractiveTutorial

A step-by-step guided tour overlay with progress tracking and optional element highlighting.

### Features

- **Step indicators** with progress bar
- **Element highlighting** (optional)
- **Quiz support** (check understanding)
- **Tips** for each step
- **Skip/back navigation**

### Usage

```tsx
import InteractiveTutorial, { 
  ONBOARDING_STEPS,
  DEPLOYMENT_STEPS,
  TutorialStep 
} from '@/src/components/onboarding/InteractiveTutorial';

<InteractiveTutorial
  steps={ONBOARDING_STEPS}
  onComplete={() => markTutorialComplete()}
  onSkip={() => setShowTutorial(false)}
  title="Welcome Tour"
/>
```

### Custom Steps

```tsx
const customSteps: TutorialStep[] = [
  {
    id: 'step-1',
    title: 'Welcome!',
    description: 'This is a custom step.',
    tip: 'Optional helpful tip',
    highlightSelector: '[data-tutorial="target"]', // Optional
    position: 'bottom', // top | bottom | left | right | center
    quiz: { // Optional
      question: 'What did you learn?',
      options: ['A', 'B', 'C'],
      correctIndex: 0,
      explanation: 'A is correct because...'
    }
  }
];
```

## ProjectSelectionViewport

A component that helps new users choose their first project in Star Sailors.

### Features

- **Project Selection Grid**: Shows 7 different project types with descriptions and icons
- **Fast Deploy Integration**: Ready for future fast deployment functionality
- **Smooth Animations**: Page transitions and selection feedback
- **Responsive Design**: Works on mobile and desktop
- **Conditional Display**: Only shows for users with 0 classifications

### Project Types

1. **Discover Asteroids** - Hunt for asteroids in telescope images → `/activity/deploy`
2. **Discover Exoplanets** - Find planets using transit data → `/activity/deploy`  
3. **Find Clouds & Storms** - Track atmospheric phenomena → `/viewports/satellite/deploy`
4. **Train Rovers** - Help rovers navigate terrain → `/viewports/deploy/roover`
5. **Investigate Planets** - Study planetary properties → `/viewports/satellite/deploy`
6. **Track Ice Formation** - Monitor sublimation behavior → `/viewports/satellite/deploy`
7. **Solar Storms & Flares** - Observe solar activity → `/viewports/sunspots`

### Usage

```tsx
import ProjectSelectionViewport from '@/src/components/onboarding/ProjectSelectionViewport';

<ProjectSelectionViewport 
  classificationsCount={0}
  showWelcomeMessage={true}
  onProjectSelect={(projectId) => {
    console.log('Selected:', projectId);
  }}
/>
```

## useUserPreferences Hook

A hook for managing user preferences stored in localStorage.

### Features

- **Project interests** - Which projects the user wants to focus on
- **Onboarding state** - Track tutorial/guide completion
- **Device detection** - Prompt for preferences on new devices
- **Structure order** - Custom dashboard layout

### Usage

```tsx
import { useUserPreferences, ProjectType } from '@/src/hooks/useUserPreferences';

const {
  preferences,
  isLoading,
  needsPreferencesPrompt,
  setProjectInterests,
  completeOnboarding,
  markStructureGuideSeen,
  resetPreferences,
} = useUserPreferences();
```

## Integration with TutorialContentBlock

The existing `TutorialContentBlock` component (in `/src/components/projects/`) has been enhanced with:

- **Tips** for each slide
- **Quiz questions** to check understanding
- **Scientific context** banner explaining real-world impact
- **Structure type** association

```tsx
import TutorialContentBlock, { 
  createTutorialSlides, 
  SCIENTIFIC_CONTEXTS 
} from '@/src/components/projects/TutorialContentBlock';

const slides = createTutorialSlides([
  {
    title: 'Step 1',
    text: 'Description',
    image: '/path/to/image.png',
    tip: 'Helpful tip!',
    quiz: {
      question: 'Question?',
      options: ['A', 'B', 'C'],
      correctIndex: 0,
      explanation: 'Explanation'
    }
  }
]);

<TutorialContentBlock
  classificationtype="cloud"
  slides={slides}
  onComplete={() => {}}
  title="Tutorial Title"
  scientificContext={SCIENTIFIC_CONTEXTS['balloon-marsCloudShapes']}
  structureType="satellite"
/>
```