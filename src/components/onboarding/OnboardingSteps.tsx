"use client";

import { Shield, Zap, Loader2, Check, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/src/shared/utils";
import { ProjectType } from "@/src/hooks/useUserPreferences";
import { OnboardingSchematic } from "./OnboardingSchematic";
import { PROJECTS } from "./onboarding-data";

/**
 * STEP 1: INTRO
 */
interface IntroStepProps {
  isPoweringUp: boolean;
  onPowerUp: () => void;
}

export function IntroStep({ isPoweringUp, onPowerUp }: IntroStepProps) {
  return (
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
          onClick={onPowerUp}
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
  );
}

/**
 * STEP 2: PROJECT SELECTION
 */
interface ProjectSelectionStepProps {
  selectedProject: ProjectType | null;
  onSelectProject: (id: ProjectType) => void;
  onContinue: () => void;
}

export function ProjectSelectionStep({ selectedProject, onSelectProject, onContinue }: ProjectSelectionStepProps) {
  return (
    <div className="flex flex-1 flex-col animate-fade-up">
      <header className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Protocol 01</span>
        <h2 className="mt-2 text-3xl font-black tracking-tight leading-tight">Select your first project</h2>
        <p className="mt-2 text-sm text-muted-foreground">This determines which structure you will deploy first.</p>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto pb-8 pr-1 scrollbar-hide">
        <OnboardingSchematic selected={selectedProject} />
        <div className="space-y-4">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={cn(
                "sci-fi-panel relative w-full p-5 text-left transition-all duration-300",
                selectedProject === p.id 
                  ? cn("border-primary bg-primary/10 ring-2 ring-primary/30", p.glow)
                  : "hover:border-primary/50 hover:bg-muted/30"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("mt-1 rounded-lg p-2 bg-background/50 border border-border/50 shadow-sm", p.color)}>
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
      </div>

      <div className="pt-4 mt-auto">
        <button
          onClick={onContinue}
          disabled={!selectedProject}
          className="btn-glow flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all active:scale-95 disabled:opacity-30"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * STEP 3: STRUCTURE INTRO
 */
interface StructureIntroStepProps {
  selectedProject: ProjectType;
  onFinalise: () => void;
}

export function StructureIntroStep({ selectedProject, onFinalise }: StructureIntroStepProps) {
  const p = PROJECTS.find(proj => proj.id === selectedProject);
  if (!p) return null;

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
          onClick={onFinalise}
          className="btn-glow flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-black uppercase tracking-widest text-primary-foreground transition-all active:scale-95"
        >
          Start Deployment
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
