"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { usePageData } from "@/hooks/usePageData";
import { useUserPreferences } from "@/src/hooks/useUserPreferences";
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import StructureExplainer from "@/src/components/onboarding/StructureExplainer";
import InteractiveTutorial, {
  ONBOARDING_STEPS,
} from "@/src/components/onboarding/InteractiveTutorial";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Sparkles,
  Target,
  Telescope,
  Satellite,
  Car,
  Sun,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Settings2,
  Rocket,
} from "lucide-react";
import { cn } from "@/src/shared/utils";
import { ProjectType } from "@/src/hooks/useUserPreferences";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  action?: () => void;
  actionLabel?: string;
}

export default function OnboardingTab() {
  const session = useSession();
  const { classifications } = usePageData();
  const {
    preferences,
    isLoading: preferencesLoading,
    needsPreferencesPrompt,
    setProjectInterests,
    completeOnboarding,
    markStructureGuideSeen,
    resetPreferences,
  } = useUserPreferences();

  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStructureGuide, setShowStructureGuide] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<
    "telescope" | "satellite" | "rover" | "solar" | null
  >(null);

  // Check if user needs preferences prompt on mount
  useEffect(() => {
    if (!preferencesLoading && needsPreferencesPrompt) {
      setShowPreferencesModal(true);
    }
  }, [preferencesLoading, needsPreferencesPrompt]);

  // Calculate onboarding progress
  const hasClassifications = classifications.length > 0;
  const hasSetPreferences = preferences.projectInterests.length > 0;
  const hasCompletedTutorial = preferences.hasCompletedOnboarding;
  const hasSeenStructures = preferences.hasSeenStructureGuide;

  const onboardingSteps: OnboardingStep[] = [
    {
      id: "preferences",
      title: "Choose Your Interests",
      description: "Tell us what excites you most - planets, asteroids, rovers, or solar activity.",
      isComplete: hasSetPreferences,
      action: () => setShowPreferencesModal(true),
      actionLabel: hasSetPreferences ? "Update Preferences" : "Get Started",
    },
    {
      id: "tutorial",
      title: "Learn the Basics",
      description: "A quick interactive tour of your space station and how to make discoveries.",
      isComplete: hasCompletedTutorial,
      action: () => setShowTutorial(true),
      actionLabel: hasCompletedTutorial ? "Replay Tutorial" : "Start Tour",
    },
    {
      id: "structures",
      title: "Explore Your Structures",
      description: "Learn what each structure does and how they connect to real science.",
      isComplete: hasSeenStructures,
      action: () => setShowStructureGuide(true),
      actionLabel: "Explore Structures",
    },
    {
      id: "first-classification",
      title: "Make Your First Discovery",
      description: "Deploy a structure and complete your first classification to join the mission!",
      isComplete: hasClassifications,
      actionLabel: "Go to Structures",
    },
  ];

  const completedCount = onboardingSteps.filter((s) => s.isComplete).length;
  const progress = (completedCount / onboardingSteps.length) * 100;

  // Handle preference save
  const handlePreferencesSave = (interests: ProjectType[]) => {
    setProjectInterests(interests);
    setShowPreferencesModal(false);
  };

  // Handle tutorial complete
  const handleTutorialComplete = () => {
    completeOnboarding();
    setShowTutorial(false);
  };

  // Structure quick access cards
  const structureCards = [
    {
      id: "telescope" as const,
      name: "Telescope",
      icon: <Telescope className="w-6 h-6" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
    },
    {
      id: "satellite" as const,
      name: "Satellite",
      icon: <Satellite className="w-6 h-6" />,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
    },
    {
      id: "rover" as const,
      name: "Rover",
      icon: <Car className="w-6 h-6" />,
      color: "text-green-400",
      bgColor: "bg-green-500/10 hover:bg-green-500/20",
    },
    {
      id: "solar" as const,
      name: "Solar Observatory",
      icon: <Sun className="w-6 h-6" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
    },
  ];

  if (preferencesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Preferences Modal */}
      <ProjectPreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSave={handlePreferencesSave}
        initialInterests={preferences.projectInterests}
      />

      {/* Interactive Tutorial */}
      {showTutorial && (
        <InteractiveTutorial
          steps={ONBOARDING_STEPS}
          onComplete={handleTutorialComplete}
          onSkip={() => setShowTutorial(false)}
          title="Welcome Tour"
        />
      )}

      {/* Structure Guide Modal */}
      {showStructureGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {selectedStructure ? (
              <StructureExplainer
                structureId={selectedStructure}
                onClose={() => {
                  markStructureGuideSeen();
                  setSelectedStructure(null);
                }}
              />
            ) : (
              <StructureExplainer
                showAll
                onClose={() => setShowStructureGuide(false)}
                onComplete={() => {
                  markStructureGuideSeen();
                  setShowStructureGuide(false);
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8 py-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">
              Welcome{session?.user?.email ? `, ${session.user.email.split("@")[0]}` : ""}!
            </h2>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            You're about to become a citizen scientist. Your discoveries will contribute
            to real space research!
          </p>
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold">Getting Started Progress</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {onboardingSteps.length} complete
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {onboardingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg transition-colors",
                    step.isComplete
                      ? "bg-green-500/10 border border-green-500/20"
                      : "bg-card/50 border border-border/50"
                  )}
                >
                  {/* Step number / check */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                      step.isComplete
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        "font-semibold",
                        step.isComplete ? "text-green-500" : "text-foreground"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                  </div>

                  {/* Action */}
                  {step.action && (
                    <Button
                      variant={step.isComplete ? "ghost" : "default"}
                      size="sm"
                      onClick={step.action}
                      className="flex-shrink-0 gap-1"
                    >
                      {step.actionLabel}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* All complete message */}
            {completedCount === onboardingSteps.length && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                <Sparkles className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-green-500">You're all set!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start making discoveries by deploying your structures.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Structure Access */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              Learn About Structures
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {structureCards.map((structure) => (
              <button
                key={structure.id}
                onClick={() => {
                  setSelectedStructure(structure.id);
                  setShowStructureGuide(true);
                }}
                className={cn(
                  "relative p-4 rounded-xl border transition-all text-left",
                  structure.bgColor,
                  "border-border/50 hover:border-border"
                )}
              >
                {preferences.hasSeenStructureGuide && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-green-500" />
                )}
                <div className={cn("mb-2", structure.color)}>{structure.icon}</div>
                <p className="font-medium text-sm">{structure.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* User Preferences Summary */}
        {hasSetPreferences && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-muted-foreground" />
                  Your Interests
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferencesModal(true)}
                >
                  Edit
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.projectInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {interest
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reset Option */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetPreferences}
            className="text-muted-foreground gap-2"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Onboarding
          </Button>
        </div>
      </div>
    </>
  );
}
