# Onboarding Components

This directory contains components for new user onboarding and project selection.

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
    // Handle fast deployment logic
  }}
/>
```

### Integration

The component is integrated into the main activity page (`app/page.tsx`) and only displays for users who have made 0 classifications. Once they select a project and activate tools, they are redirected to the appropriate deployment page.

### Future Enhancements

- Fast deployment backend integration
- Progress tracking
- Project recommendations based on user behavior
- Tutorial integration