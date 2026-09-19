"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { Loader2 } from "lucide-react";
import { useUserPreferences, ProjectType } from "@/src/hooks/useUserPreferences";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { IntroSequence } from "@/src/components/onboarding/IntroSequence";
import { IntroStep, ProjectSelectionStep, StructureIntroStep } from "@/src/components/onboarding/OnboardingSteps";
import { SETUP_MAP } from "@/src/components/onboarding/onboarding-data";
import type { HubOnboardingStep } from "@/src/features/onboarding/hubState";

type Step = HubOnboardingStep;

export default function OnboardingPage() {
  const router = useRouter();
  const posthog = usePostHog();
  const { user, isLoading: authLoading } = useAuthUser();
  const {
    preferences,
    isLoading: prefsLoading,
    setProjectInterests,
    completeOnboarding,
    setOnboardingProgress,
    hasTutorialCompleted,
    markTutorialComplete,
  } = useUserPreferences(user?.id);

  const [showIntro, setShowIntro] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [isPoweringUp, setIsPoweringUp] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    async function checkExistingProfile() {
      try {
        const res = await fetch("/api/gameplay/profile/me");
        if (res.ok) {
          const profile = await res.json();
          if (profile && profile.username) {
            completeOnboarding();
            router.replace("/game");
          }
        }
      } catch (err) {
        console.error("Error checking existing profile:", err);
      }
    }

    if (!preferences.hasCompletedOnboarding) {
      checkExistingProfile();
    }
  }, [user, authLoading, router, completeOnboarding, preferences.hasCompletedOnboarding]);

  useEffect(() => {
    if (!prefsLoading && preferences.hasCompletedOnboarding) {
      router.replace("/game");
    }
  }, [prefsLoading, preferences.hasCompletedOnboarding, router]);

  useEffect(() => {
    if (prefsLoading || preferences.hasCompletedOnboarding) return;
    const savedStep = preferences.inProgressStep;
    const savedProject = preferences.inProgressProject;
    if (savedStep && savedStep !== "intro") {
      if (savedStep === "structure-intro" && !savedProject) {
        setStep("project-selection");
      } else {
        setStep(savedStep);
        if (savedProject) setSelectedProject(savedProject);
      }
      return;
    }
    if (!hasTutorialCompleted("init-seen")) {
      setShowIntro(true);
    }
  }, [hasTutorialCompleted, preferences.hasCompletedOnboarding, preferences.inProgressProject, preferences.inProgressStep, prefsLoading]);

  useEffect(() => {
    if (!authLoading && user && !prefsLoading && !preferences.hasCompletedOnboarding) {
      posthog?.capture("onboarding_started", { userId: user.id });
    }
  }, [authLoading, posthog, prefsLoading, preferences.hasCompletedOnboarding, user]);

  if (authLoading || prefsLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const startPowerUp = () => {
    setIsPoweringUp(true);
    setTimeout(() => {
      setStep("project-selection");
      setOnboardingProgress({ step: "project-selection" });
      setIsPoweringUp(false);
    }, 2000);
  };

  const handleFinalise = () => {
    if (!selectedProject) return;
    setProjectInterests([selectedProject]);
    completeOnboarding();
    posthog?.capture("onboarding_completed", { userId: user.id, project: selectedProject });
    router.push(SETUP_MAP[selectedProject] ?? "/game");
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-background text-foreground font-sans">
      {showIntro && (
        <IntroSequence
          onComplete={() => {
            markTutorialComplete("init-seen");
            setShowIntro(false);
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 star-field opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      <main className="relative z-10 mx-auto flex min-h-[100dvh] max-w-lg flex-col px-6 py-8">

        {step === "intro" && (
          <IntroStep
            isPoweringUp={isPoweringUp}
            onPowerUp={startPowerUp}
          />
        )}

        {step === "project-selection" && (
          <ProjectSelectionStep
            selectedProject={selectedProject}
            onSelectProject={(p) => {
              setSelectedProject(p);
              setOnboardingProgress({ step: "project-selection", project: p });
            }}
            onContinue={() => {
              setStep("structure-intro");
              setOnboardingProgress({ step: "structure-intro", project: selectedProject });
            }}
          />
        )}

        {step === "structure-intro" && selectedProject && (
          <StructureIntroStep
            selectedProject={selectedProject}
            onFinalise={handleFinalise}
          />
        )}

        <footer className="mt-8 flex items-center justify-between border-t border-border/40 pt-6">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">System Online</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
