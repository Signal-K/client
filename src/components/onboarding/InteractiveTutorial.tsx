"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/src/shared/utils";
import { Button } from "@/src/components/ui/button";
import {
  ChevronRight,
  ChevronLeft,
  X,
  Target,
  Sparkles,
  CheckCircle2,
  Circle,
  Lightbulb,
  MousePointer2,
} from "lucide-react";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  /** Optional element selector to highlight */
  highlightSelector?: string;
  /** Optional action the user needs to take */
  action?: {
    type: "click" | "wait" | "any";
    targetSelector?: string;
    waitMs?: number;
  };
  /** Tip shown after the main content */
  tip?: string;
  /** Image or icon to display */
  visual?: React.ReactNode;
  /** Position of the tooltip relative to highlighted element */
  position?: "top" | "bottom" | "left" | "right" | "center";
}

interface InteractiveTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip?: () => void;
  /** Called when moving to a step (for analytics) */
  onStepChange?: (stepIndex: number, stepId: string) => void;
  /** Starting step index */
  startStep?: number;
  /** Allow skipping individual steps */
  allowSkipSteps?: boolean;
  /** Tutorial title */
  title?: string;
}

export default function InteractiveTutorial({
  steps,
  onComplete,
  onSkip,
  onStepChange,
  startStep = 0,
  allowSkipSteps = true,
  title = "Getting Started",
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(startStep);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isWaiting, setIsWaiting] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Update highlight position when step changes
  useEffect(() => {
    if (step?.highlightSelector) {
      const element = document.querySelector(step.highlightSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect(rect);

        // Scroll element into view if needed
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  }, [step]);

  // Handle action completion
  useEffect(() => {
    if (!step?.action) return;

    if (step.action.type === "wait" && step.action.waitMs) {
      setIsWaiting(true);
      const timer = setTimeout(() => {
        setIsWaiting(false);
        markStepComplete(step.id);
      }, step.action.waitMs);
      return () => clearTimeout(timer);
    }

    if (step.action.type === "click" && step.action.targetSelector) {
      const handler = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.matches(step.action!.targetSelector!)) {
          markStepComplete(step.id);
          goNext();
        }
      };
      document.addEventListener("click", handler, true);
      return () => document.removeEventListener("click", handler, true);
    }
  }, [step]);

  const markStepComplete = useCallback((stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  }, []);

  const goNext = useCallback(() => {
    markStepComplete(step.id);

    if (isLastStep) {
      onComplete();
    } else {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex, steps[nextIndex].id);
    }
  }, [currentStep, isLastStep, onComplete, onStepChange, step, steps, markStepComplete]);

  const goPrev = useCallback(() => {
    if (!isFirstStep) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      onStepChange?.(prevIndex, steps[prevIndex].id);
    }
  }, [currentStep, isFirstStep, onStepChange, steps]);

  const goToStep = useCallback(
    (index: number) => {
      if (allowSkipSteps || index <= currentStep || completedSteps.has(steps[index - 1]?.id)) {
        setCurrentStep(index);
        onStepChange?.(index, steps[index].id);
      }
    },
    [allowSkipSteps, currentStep, completedSteps, onStepChange, steps]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onSkip) {
        onSkip();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onSkip]);

  // Tooltip position calculation
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightRect || step?.position === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const padding = 16;
    const tooltipWidth = 400;
    const tooltipHeight = 300;

    switch (step?.position) {
      case "top":
        return {
          position: "fixed",
          bottom: window.innerHeight - highlightRect.top + padding,
          left: Math.max(padding, highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2),
        };
      case "bottom":
        return {
          position: "fixed",
          top: highlightRect.bottom + padding,
          left: Math.max(padding, highlightRect.left + highlightRect.width / 2 - tooltipWidth / 2),
        };
      case "left":
        return {
          position: "fixed",
          top: Math.max(padding, highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2),
          right: window.innerWidth - highlightRect.left + padding,
        };
      case "right":
        return {
          position: "fixed",
          top: Math.max(padding, highlightRect.top + highlightRect.height / 2 - tooltipHeight / 2),
          left: highlightRect.right + padding,
        };
      default:
        return {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Highlight cutout */}
      {highlightRect && (
        <div
          className="fixed z-50 ring-4 ring-primary/50 rounded-lg pointer-events-none"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
          }}
        >
          {/* Pulsing indicator */}
          <div className="absolute -top-2 -right-2">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-primary rounded-full w-4 h-4" />
              <MousePointer2 className="w-4 h-4 text-primary relative z-10" />
            </div>
          </div>
        </div>
      )}

      {/* Tutorial card */}
      <div
        className="z-50 w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
        style={getTooltipStyle() as React.CSSProperties}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">{title}</span>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors text-muted-foreground"
                aria-label="Skip tutorial (or press ESC)"
                title="Skip tutorial (or press ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {steps.map((s, index) => {
              const isComplete = completedSteps.has(s.id);
              const isCurrent = index === currentStep;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(index)}
                  disabled={!allowSkipSteps && index > currentStep && !isComplete}
                  className={cn(
                    "transition-all",
                    allowSkipSteps || index <= currentStep || isComplete
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  )}
                  aria-label={`Go to step ${index + 1}: ${s.title}`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Visual */}
          {step.visual && (
            <div className="mb-4 flex justify-center">{step.visual}</div>
          )}

          {/* Step title */}
          <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>

          {/* Step description */}
          <p className="text-muted-foreground leading-relaxed">{step.description}</p>

          {/* Waiting indicator */}
          {isWaiting && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Please wait...
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-200">{step.tip}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={isFirstStep}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} / {steps.length}
          </span>

          <Button
            onClick={goNext}
            disabled={isWaiting}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                Complete
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

// Preset tutorial flows
export const ONBOARDING_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to Star Sailors! 🚀",
    description:
      "You're about to become a citizen scientist! Your discoveries will contribute to real space research and help us understand our universe.",
    tip: "Everything you do here uses real data from NASA and other space agencies.",
    position: "center",
  },
  {
    id: "structures-overview",
    title: "Your Space Station",
    description:
      "You have four main structures: a Telescope for observing distant stars, a Satellite for orbiting planets, a Rover for surface exploration, and a Solar Observatory for monitoring the Sun.",
    tip: "Each structure unlocks different types of discoveries.",
    position: "center",
  },
  {
    id: "telescope-intro",
    title: "Start with Your Telescope",
    description:
      "The telescope is the heart of your station. Use it to hunt for exoplanets by analyzing light curves - you're looking for tiny dips in brightness when a planet passes in front of its star.",
    highlightSelector: "[data-structure='telescope']",
    position: "bottom",
  },
  {
    id: "deploy-structure",
    title: "Deploy Your Structure",
    description:
      "Click on any structure to deploy it. Once deployed, you'll see missions you can complete. Each mission teaches you something new while contributing to real science!",
    tip: "Start with the beginner missions - they'll walk you through everything.",
    position: "center",
  },
  {
    id: "earn-rewards",
    title: "Earn Stardust & Discoveries",
    description:
      "Complete missions to earn Stardust (our currency) and make real discoveries. Your classifications are reviewed by scientists and can appear in actual research papers!",
    position: "center",
  },
  {
    id: "ready-to-explore",
    title: "You're Ready to Explore!",
    description:
      "That's all you need to get started. Deploy your telescope and make your first discovery. The universe is waiting for you!",
    tip: "Don't worry about making mistakes - learning is part of the journey.",
    position: "center",
  },
];

export const DEPLOYMENT_STEPS: TutorialStep[] = [
  {
    id: "select-location",
    title: "Choose a Location",
    description:
      "First, select where you want to deploy this structure. Different locations offer different types of discoveries.",
    position: "center",
  },
  {
    id: "view-missions",
    title: "Browse Available Missions",
    description:
      "Each location has unique missions. Look for ones marked 'Beginner' if you're just starting out.",
    position: "center",
  },
  {
    id: "start-mission",
    title: "Start Your Mission",
    description:
      "Click on a mission to begin. You'll see real scientific data and instructions on what to look for.",
    position: "center",
  },
  {
    id: "make-classification",
    title: "Make Your Classification",
    description:
      "Analyze the data and submit your classification. Don't worry about being perfect - multiple people classify each item, and consensus determines the answer.",
    tip: "Your classifications are compared with others. This 'wisdom of the crowd' approach is how real science works!",
    position: "center",
  },
  {
    id: "earn-rewards",
    title: "Collect Your Rewards",
    description:
      "After classifying, you'll earn Stardust and XP. Complete enough missions to level up and unlock new structures!",
    position: "center",
  },
];
