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
    } else {
      setShowTutorial(false);
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
      <div className="relative h-full w-full">
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
        <div className="relative h-full w-full">
          {children}
        </div>
      </>
    );
  }

  // Tutorial completed - show content with optional replay button
  return (
    <div className="relative h-full w-full">
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
    id: "telescope-init",
    title: "Telescope Protocol",
    description:
      "Initialize your connection to orbital observatories. Deployments target specific sectors to identify anomalies in starlight data.",
    tip: "Multiple exoplanets have been identified using these specific data sets.",
    position: "center",
  },
  {
    id: "telescope-view-scan",
    title: "Sensor View",
    description:
      "This viewport displays the current sector. Active stars are marked for observation.",
    action: { type: "wait", waitMs: 3000 },
    position: "center",
  },
  {
    id: "telescope-find-deploy",
    title: "Deployment Control",
    description:
      "Locate the deployment control to target a new sector for the current cycle.",
    highlightSelector: "[data-tutorial='deploy-telescope']",
    position: "bottom",
  },
  {
    id: "telescope-click-deploy",
    title: "Initialize Deployment",
    description:
      "Activate the deployment sequence to begin data acquisition.",
    highlightSelector: "[data-tutorial='deploy-telescope']",
    action: { type: "click", targetSelector: "[data-tutorial='deploy-telescope']" },
    position: "bottom",
  },
];

export const TELESCOPE_DEPLOY_STEPS: TutorialStep[] = [
  {
    id: "deploy-init",
    title: "Target Parameters",
    description:
      "Select a mission objective. Different focus areas yield different anomaly types.",
    position: "center",
  },
  {
    id: "deploy-select-project",
    title: "Select Objective",
    description:
      "Assign the telescope to a research track for the current cycle.",
    highlightSelector: "[data-tutorial='project-options']",
    action: { type: "click", targetSelector: "[data-tutorial='project-options']" },
    position: "center",
  },
  {
    id: "deploy-confirm",
    title: "Confirm Deployment",
    description:
      "Finalize the deployment sequence to begin scanning.",
    highlightSelector: "[data-tutorial='confirm-deploy']",
    action: { type: "click", targetSelector: "[data-tutorial='confirm-deploy']" },
    position: "center",
  },
];

export const SATELLITE_INTRO_STEPS: TutorialStep[] = [
  {
    id: "satellite-init",
    title: "Satellite Operations",
    description:
      "Orbital assets capture planetary surface and atmospheric data. Select a mission mode to begin.",
    position: "center",
  },
  {
    id: "satellite-explore",
    title: "Mission Mode",
    description:
      "Configuration options: Weather Analysis, Planetary Survey, or Wind Survey.",
    action: { type: "wait", waitMs: 3000 },
    position: "center",
  },
  {
    id: "satellite-pick-planet",
    title: "Target Selection",
    description:
      "Assign an orbital target. Available targets depend on previous planetary classifications.",
    highlightSelector: "[data-tutorial='planet-select']",
    position: "center",
  },
  {
    id: "satellite-deploy",
    title: "Execute Deployment",
    description:
      "Initiate orbital insertion and begin data collection.",
    highlightSelector: "[data-tutorial='deploy-satellite']",
    action: { type: "click", targetSelector: "[data-tutorial='deploy-satellite']" },
    position: "center",
  },
];

export const ROVER_INTRO_STEPS: TutorialStep[] = [
  {
    id: "rover-init",
    title: "Rover Operations",
    description:
      "Surface assets traverse Martian terrain to identify geological features. Waypoints determine the path of travel.",
    position: "center",
  },
  {
    id: "rover-look-surface",
    title: "Terrain Survey",
    description:
      "Initial terrain analysis. Surface features will be queued for manual classification during traversal.",
    action: { type: "wait", waitMs: 3000 },
    position: "center",
  },
  {
    id: "rover-deploy-button",
    title: "Initialize Rover",
    description:
      "Activate the rover and define travel parameters.",
    highlightSelector: "[data-tutorial='deploy-rover']",
    action: { type: "click", targetSelector: "[data-tutorial='deploy-rover']" },
    position: "center",
  },
];

export const SOLAR_INTRO_STEPS: TutorialStep[] = [
  {
    id: "solar-init",
    title: "Solar Observatory",
    description:
      "Observatory systems monitor solar activity and classify sunspot formations.",
    position: "center",
  },
  {
    id: "solar-observe-sun",
    title: "Solar Analysis",
    description:
      "Magnetic activity is represented in the 3D model. Identify sunspot groups for classification.",
    action: { type: "wait", waitMs: 3000 },
    tip: "The solar model can be rotated to view all active regions.",
    position: "center",
  },
  {
    id: "solar-participate",
    title: "Join Mission",
    description:
      "Contribute data to the current solar monitoring cycle.",
    highlightSelector: "[data-tutorial='participate-solar']",
    action: { type: "click", targetSelector: "[data-tutorial='participate-solar']" },
    position: "center",
  },
];
