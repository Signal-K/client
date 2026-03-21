"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { 
  Telescope, 
  Car, 
  Satellite, 
  ArrowRight, 
  Check, 
  Shield, 
  Zap, 
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/src/shared/utils";
import { useUserPreferences, ProjectType } from "@/src/hooks/useUserPreferences";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import { IntroSequence } from "@/src/components/onboarding/IntroSequence";
import { OnboardingSchematic } from "@/src/components/onboarding/OnboardingSchematic";

type Step = "intro" | "project-selection" | "structure-intro";

const PROJECTS = [
  {
    id: "planet-hunting" as ProjectType,
    name: "Planet Hunting",
    icon: Telescope,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    glow: "glow-teal",
    structure: "Telescope",
    description: "Search for dips in light from distant stars using TESS data. Discover new worlds."
  },
  {
    id: "rover-training" as ProjectType,
    name: "Rover Training",
    icon: Car,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "glow-amber",
    structure: "Rover",
    description: "Analyse Martian terrain images to help autonomous rovers navigate safely."
  },
  {
    id: "cloud-tracking" as ProjectType,
    name: "Cloud Spotting",
    icon: Satellite,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    glow: "glow-sky",
    structure: "Satellite",
    description: "Track Martian clouds and Jovian vortices using orbital imagery. Map planetary weather."
  }
];

const SETUP_MAP: Record<ProjectType, string> = {
  "planet-hunting": "/setup/telescope",
  "rover-training": "/setup/rover",
  "cloud-tracking": "/setup/satellite",
  "asteroid-hunting": "/setup/telescope",
  "ice-tracking": "/setup/satellite",
  "solar-monitoring": "/setup/solar"
};

export default function OnboardingPage() {
  const router = useRouter();
  const posthog = usePostHog();
  const { user, isLoading: authLoading } = useAuthUser();
  const { preferences, isLoading: prefsLoading, setProjectInterests, completeOnboarding, hasTutorialCompleted, markTutorialComplete } = useUserPreferences();
  
  const [showIntro, setShowIntro] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [isPoweringUp, setIsPoweringUp] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Skip onboarding for returning users
  useEffect(() => {
    if (!prefsLoading && preferences.hasCompletedOnboarding) {
      router.replace("/game");
    }
  }, [prefsLoading, preferences.hasCompletedOnboarding, router]);

  // Show intro sequence on first visit only
  useEffect(() => {
    if (!prefsLoading && !preferences.hasCompletedOnboarding) {
      if (!hasTutorialCompleted("intro-seen")) {
        setShowIntro(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsLoading]);

  // Fire onboarding_started once on mount (for new users)
  useEffect(() => {
    if (!authLoading && user && !prefsLoading && !preferences.hasCompletedOnboarding) {
      posthog?.capture("onboarding_started", { userId: user.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, prefsLoading]);

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
      setIsPoweringUp(false);
    }, 2000);
  };

  const handleProjectSelect = (id: ProjectType) => {
    setSelectedProject(id);
  };

  const handleFinalise = () => {
    if (!selectedProject) return;
    setProjectInterests([selectedProject]);
    completeOnboarding();
    posthog?.capture("onboarding_completed", { userId: user.id, project: selectedProject });
    router.push(SETUP_MAP[selectedProject] ?? "/game");
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-background text-foreground font-sans">
      {showIntro && (
        <IntroSequence
          onComplete={() => {
            markTutorialComplete("intro-seen");
            setShowIntro(false);
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 star-field opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      <main className="relative z-10 mx-auto flex h-[100dvh] max-w-lg flex-col px-6 py-8">
        
        {/* STEP 1: INTRO */}
        {step === "intro" && (
          <div className="flex flex-1 flex-col justify-center animate-fade-up">
            <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Station<br />Arrival.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Welcome, Sailor. Your operator station is currently in standby mode. 
              We need to initialise your primary mission protocol.
            </p>
            
            <div className="mt-12">
              <button
                onClick={startPowerUp}
                disabled={isPoweringUp}
                className="btn-glow relative flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all active:scale-95 disabled:opacity-50"
              >
                {isPoweringUp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initialising Systems...
                  </>
                ) : (
                  <>
                    Power Up Station
                    <Zap className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROJECT SELECTION */}
        {step === "project-selection" && (
          <div className="flex flex-1 flex-col animate-fade-up">
            <header className="mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Protocol 01</span>
              <h2 className="mt-2 text-3xl font-black tracking-tight">Select your first project</h2>
              <p className="mt-2 text-sm text-muted-foreground">This determines which structure you will deploy first.</p>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto pb-6 pr-1">
              <OnboardingSchematic selected={selectedProject} />
              {PROJECTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProjectSelect(p.id)}
                  className={cn(
                    "sci-fi-panel relative w-full p-5 text-left transition-all duration-300",
                    selectedProject === p.id 
                      ? cn("border-primary bg-primary/10 ring-1 ring-primary/50", p.glow)
                      : "hover:border-primary/50 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("mt-1 rounded-lg p-2 bg-background/50 border border-border/50", p.color)}>
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-foreground">{p.name}</h3>
                        {selectedProject === p.id && (
                          <div className="rounded-full bg-primary p-1">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", p.color)}>
                          Requires {p.structure}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  if (selectedProject) {
                    posthog?.capture("onboarding_project_selected", { project: selectedProject });
                    setStep("structure-intro");
                  }
                }}
                disabled={!selectedProject}
                className="btn-glow flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all active:scale-95 disabled:opacity-30"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: STRUCTURE INTRO */}
        {step === "structure-intro" && selectedProject && (() => {
          const p = PROJECTS.find(proj => proj.id === selectedProject)!;
          return (
            <div className="flex flex-1 flex-col justify-center animate-fade-up">
              <div className={cn("mb-8 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-background border-2 shadow-2xl", p.border)}>
                <p.icon className={cn("h-10 w-10", p.color)} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Hardware Assigned</span>
              <h2 className="mt-2 text-4xl font-black tracking-tight italic">
                {p.structure}<br />initialised.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                To begin the {p.name} mission, you need to deploy your first {p.structure}. 
                We'll guide you through the setup on the next screen.
              </p>
              
              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-4 border border-border/50">
                  <div className="rounded-full bg-primary/20 p-2">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-xs font-semibold text-foreground/80">You'll earn your first stardust for completing the setup.</p>
                </div>
              </div>

              <div className="mt-12">
                <button
                  onClick={handleFinalise}
                  className="btn-glow flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all active:scale-95"
                >
                  Start Deployment
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* HUD footer */}
        <footer className="mt-8 flex items-center justify-between border-t border-border/40 pt-6">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">System Online</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/40 uppercase">v3.0.0-alpha</span>
        </footer>
      </main>
    </div>
  );
}
