"use client";

import InteractiveTutorial, { TutorialStep } from "@/src/components/onboarding/InteractiveTutorial";
import type { StructureId } from "./StructureCard";

const DEPLOY_STEPS: Record<StructureId, TutorialStep[]> = {
  telescope: [
    {
      id: "telescope-what",
      title: "Deploying your Telescope",
      description: "Your telescope scans for dips in starlight — the signature of a planet passing in front of its star. Real TESS data, real discoveries.",
      position: "center",
    },
    {
      id: "telescope-how",
      title: "How it works",
      description: "Select a target star, review its light curve, and mark any dips you see. Each classification you submit goes to the Planet Hunters database.",
      position: "center",
    },
    {
      id: "telescope-after",
      title: "After deployment",
      description: "Signals will appear on your hub radar. Tap the Telescope card to classify them whenever you're ready — no time pressure.",
      position: "center",
    },
  ],
  satellite: [
    {
      id: "satellite-what",
      title: "Deploying your Satellite",
      description: "Your satellite captures orbital imagery of Mars and Jupiter. You'll classify cloud formations and atmospheric patterns.",
      position: "center",
    },
    {
      id: "satellite-how",
      title: "How it works",
      description: "Review orbital images and annotate cloud types or vortex patterns. Your annotations help scientists track planetary weather.",
      position: "center",
    },
    {
      id: "satellite-after",
      title: "After deployment",
      description: "New imagery arrives regularly. The satellite card will glow when data is ready for your review.",
      position: "center",
    },
  ],
  rover: [
    {
      id: "rover-what",
      title: "Deploying your Rover",
      description: "Your rover analyses Martian terrain images to help train autonomous navigation AI. Real Mars surface data.",
      position: "center",
    },
    {
      id: "rover-how",
      title: "How it works",
      description: "Classify terrain types — rocks, sand, craters — in each image. Your labels train the AI that guides real rovers on Mars.",
      position: "center",
    },
    {
      id: "rover-after",
      title: "After deployment",
      description: "The rover will queue terrain images for you. It's a bit lazy — it won't rush you.",
      position: "center",
    },
  ],
  solar: [
    {
      id: "solar-what",
      title: "Joining the Solar Mission",
      description: "The Solar Array is a community mission — all sailors contribute to the same dataset. You're classifying sunspot activity from real solar imagery.",
      position: "center",
    },
    {
      id: "solar-how",
      title: "How it works",
      description: "Review solar images and mark sunspot groups. Your classifications are combined with other sailors' to produce consensus data for researchers.",
      position: "center",
    },
    {
      id: "solar-after",
      title: "You're part of the crew",
      description: "The Solar card shows community activity. The more sailors classify, the stronger the signal.",
      position: "center",
    },
  ],
};

interface GuidedDeployOverlayProps {
  structureId: StructureId;
  onComplete: () => void;
  onSkip: () => void;
}

export function GuidedDeployOverlay({ structureId, onComplete, onSkip }: GuidedDeployOverlayProps) {
  const steps = DEPLOY_STEPS[structureId];
  const label = structureId.charAt(0).toUpperCase() + structureId.slice(1);

  return (
    <InteractiveTutorial
      steps={steps}
      title={`${label} Deployment Guide`}
      onComplete={onComplete}
      onSkip={onSkip}
    />
  );
}
