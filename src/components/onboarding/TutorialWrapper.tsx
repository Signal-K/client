"use client";

import { useState, useEffect } from "react";
import { useUserPreferences, TutorialId } from "@/src/hooks/useUserPreferences";
import InteractiveTutorial, { TutorialStep } from "./InteractiveTutorial";
import { Button } from "@/src/components/ui/button";
import { HelpCircle, RotateCcw } from "lucide-react";

interface TutorialWrapperProps {
  /** Unique identifier for this tutorial */
  tutorialId: TutorialId;
  /** The tutorial steps */
  steps: TutorialStep[];
  /** Title shown in the tutorial */
  title: string;
  /** Content to render when tutorial is complete or skipped */
  children: React.ReactNode;
  /** Optional: Force show tutorial even if completed */
  forceShow?: boolean;
  /** Optional: Show replay button when tutorial is complete */
  showReplayButton?: boolean;
  /** Optional: Position of replay button */
  replayButtonPosition?: "top-right" | "bottom-right" | "inline";
  /** Optional: Callback when tutorial completes */
  onComplete?: () => void;
  /** Optional: Callback when tutorial is skipped */
  onSkip?: () => void;
}

/**
 * TutorialWrapper - Wraps content with an optional tutorial overlay
 * 
 * Shows a tutorial to users who haven't completed it yet.
 * Tutorial completion is tracked in localStorage via useUserPreferences.
 */
export default function TutorialWrapper({
  tutorialId,
  steps,
  title,
  children,
  forceShow = false,
  showReplayButton = true,
  replayButtonPosition = "top-right",
  onComplete,
  onSkip,
}: TutorialWrapperProps) {
  const {
    hasTutorialCompleted,
    markTutorialComplete,
    resetTutorial,
    isLoading,
  } = useUserPreferences();

  const [showTutorial, setShowTutorial] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Check if tutorial should be shown
  useEffect(() => {
    if (isLoading) return;
    
    const completed = hasTutorialCompleted(tutorialId);
    
    if (forceShow || !completed) {
      setShowTutorial(true);
    }
    
    setHasChecked(true);
  }, [isLoading, tutorialId, forceShow, hasTutorialCompleted]);

  const handleComplete = () => {
    markTutorialComplete(tutorialId);
    setShowTutorial(false);
    onComplete?.();
  };

  const handleSkip = () => {
    markTutorialComplete(tutorialId);
    setShowTutorial(false);
    onSkip?.();
  };

  const handleReplay = () => {
    resetTutorial(tutorialId);
    setShowTutorial(true);
  };

  // Show loading state while checking preferences
  if (!hasChecked || isLoading) {
    return (
      <div className="relative">
        {children}
      </div>
    );
  }

  // Show tutorial overlay
  if (showTutorial) {
    return (
      <>
        <InteractiveTutorial
          steps={steps}
          title={title}
          onComplete={handleComplete}
          onSkip={handleSkip}
        />
        {/* Still render children behind the overlay so users see the context */}
        <div className="pointer-events-none">
          {children}
        </div>
      </>
    );
  }

  // Tutorial completed - show content with optional replay button
  return (
    <div className="relative">
      {showReplayButton && (
        <ReplayButton
          position={replayButtonPosition}
          onReplay={handleReplay}
          title={title}
        />
      )}
      {children}
    </div>
  );
}

interface ReplayButtonProps {
  position: "top-right" | "bottom-right" | "inline";
  onReplay: () => void;
  title: string;
}

function ReplayButton({ position, onReplay, title }: ReplayButtonProps) {
  if (position === "inline") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onReplay}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="w-3 h-3" />
        Replay {title}
      </Button>
    );
  }

  const positionClasses = position === "top-right"
    ? "absolute top-2 right-2 z-40"
    : "absolute bottom-2 right-2 z-40";

  return (
    <button
      onClick={onReplay}
      className={`${positionClasses} p-2 bg-background/80 hover:bg-background border border-border rounded-lg transition-colors group`}
      title={`Replay ${title}`}
    >
      <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}

// Pre-built tutorial step sets for common scenarios
// These tutorials guide users through actual interactions with the interface

export const TELESCOPE_INTRO_STEPS: TutorialStep[] = [
  {
    id: "telescope-welcome",
    title: "Welcome to Your Telescope! 🔭",
    description:
      "Your telescope connects you to real space observatories like NASA's TESS satellite. Let's get you started with your first deployment!",
    tip: "Citizen scientists have discovered over 100 exoplanets using telescope data just like this.",
    position: "center",
  },
  {
    id: "telescope-look-around",
    title: "Look Around",
    description:
      "Take a moment to explore this view. You can see the starfield background - this represents the sector of space your telescope can observe.",
    action: { type: "wait", waitMs: 3000 },
    position: "center",
  },
  {
    id: "telescope-find-deploy",
    title: "Find the Deploy Button",
    description:
      "Look for the 'Deploy Telescope' button below. This is how you'll point your telescope at a new sector of space each week.",
    highlightSelector: "[data-tutorial='deploy-telescope']",
    position: "bottom",
  },
  {
    id: "telescope-click-deploy",
    title: "Click Deploy Telescope",
    description:
      "Go ahead and click the Deploy button to choose where to point your telescope!",
    highlightSelector: "[data-tutorial='deploy-telescope']",
    action: { type: "click", targetSelector: "[data-tutorial='deploy-telescope']" },
    position: "bottom",
  },
];

export const TELESCOPE_DEPLOY_STEPS: TutorialStep[] = [
  {
    id: "deploy-intro",
    title: "Choose Your Observation",
    description:
      "You're about to deploy your telescope! Different projects focus on different discoveries.",
    position: "center",
  },
  {
    id: "deploy-select-project",
    title: "Select a Project",
    description:
      "Click on one of the project options to choose what you'll be searching for this week.",
    highlightSelector: "[data-tutorial='project-options']",
    action: { type: "click", targetSelector: "[data-tutorial='project-options']" },
    position: "center",
  },
  {
    id: "deploy-confirm",
    title: "Confirm Your Choice",
    description:
      "Great choice! Now click the Confirm button to start your telescope scanning the sky.",
    highlightSelector: "[data-tutorial='confirm-deploy']",
    action: { type: "click", targetSelector: "[data-tutorial='confirm-deploy']" },
    position: "center",
  },
];

export const SATELLITE_INTRO_STEPS: TutorialStep[] = [
  {
    id: "satellite-welcome",
    title: "Your Orbital Satellite 🛰️",
    description:
      "Satellites orbit planets to capture images of surfaces and atmospheres. Let's learn how to use yours!",
    position: "center",
  },
  {
    id: "satellite-explore",
    title: "Explore the View",
    description:
      "This view shows planets you can observe. Take a moment to look around - you'll see the planet details and navigation controls.",
    action: { type: "wait", waitMs: 3000 },
    position: "center",
  },
  {
    id: "satellite-navigate",
    title: "Navigate Between Planets",
    description:
      "Use the arrow buttons to browse through available planets. Each planet has different characteristics to study.",
    highlightSelector: "[data-tutorial='planet-nav-next']",
    action: { type: "click", targetSelector: "[data-tutorial='planet-nav-next']" },
    position: "center",
  },
  {
    id: "satellite-deploy",
    title: "Deploy Satellite",
    description:
      "Click the Deploy Satellite button to launch your satellite into orbit around this planet.",
    highlightSelector: "[data-tutorial='deploy-satellite']",
    action: { type: "click", targetSelector: "[data-tutorial='deploy-satellite']" },
    position: "center",
  },
];

export const ROVER_INTRO_STEPS: TutorialStep[] = [
  {
    id: "rover-welcome",
    title: "Meet Your Rover 🚗",
    description:
      "Your rover explores Mars! You'll set waypoints and it will traverse the terrain, finding objects for you to classify.",
    position: "center",
  },
  {
    id: "rover-look-surface",
    title: "Survey the Surface",
    description:
      "Look at the Martian surface below. The terrain varies - sand, rocks, and geological features are all waiting to be explored.",
    action: { type: "wait", waitMs: 3000 },
    position: "center",
  },
  {
    id: "rover-deploy-button",
    title: "Deploy Your Rover",
    description:
      "Click the Deploy Rover button to set waypoints for your rover's journey across Mars.",
    highlightSelector: "[data-tutorial='deploy-rover']",
    action: { type: "click", targetSelector: "[data-tutorial='deploy-rover']" },
    position: "center",
  },
];

export const SOLAR_INTRO_STEPS: TutorialStep[] = [
  {
    id: "solar-welcome",
    title: "Solar Observatory ☀️",
    description:
      "Your solar observatory monitors our Sun! You'll count sunspots and track solar activity.",
    position: "center",
  },
  {
    id: "solar-observe-sun",
    title: "Observe the Sun",
    description:
      "Look at the 3D model of the Sun. Can you see any dark spots? Those are sunspots - areas of intense magnetic activity.",
    action: { type: "wait", waitMs: 3000 },
    tip: "Try rotating the Sun to see it from different angles!",
    position: "center",
  },
  {
    id: "solar-participate",
    title: "Join the Mission",
    description:
      "Click the Participate button to join this week's sunspot counting mission.",
    highlightSelector: "[data-tutorial='participate-solar']",
    action: { type: "click", targetSelector: "[data-tutorial='participate-solar']" },
    position: "center",
  },
];
