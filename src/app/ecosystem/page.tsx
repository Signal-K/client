"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { Compass, Gamepad2, Microscope, Pickaxe, Rocket, Satellite } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useAuthUser } from "@/src/hooks/useAuthUser";
import MechanicPulseSurvey from "@/src/features/surveys/components/MechanicPulseSurvey";
import { getOrCreateAnalyticsSessionToken } from "@/src/lib/analytics/session-token";
import {
  MECHANIC_SURVEYS,
  SURVEY_DISPLAY_DELAY_MS,
  surveyStorageKey,
} from "@/src/features/surveys/mechanic-surveys";

function safeStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage write errors.
  }
}

export default function EcosystemPage() {
  const { isDark, toggleDarkMode } = UseDarkMode();
  const posthog = usePostHog();
  const { user } = useAuthUser();
  const [analyticsSessionToken] = useState<string | null>(() => getOrCreateAnalyticsSessionToken());
  const [showSurvey, setShowSurvey] = useState(false);

  const ecosystemSurvey = useMemo(
    () => MECHANIC_SURVEYS.find((survey) => survey.id === "mechanic_ecosystem_minigame_v1") ?? null,
    []
  );

  useEffect(() => {
    if (!user || !posthog || !ecosystemSurvey) return;

    const key = surveyStorageKey(ecosystemSurvey.id, user.id);
    const alreadyDone = safeStorageGet(key) === "done";
    if (alreadyDone) return;

    const timeout = window.setTimeout(() => {
      setShowSurvey(true);
      posthog.capture("mechanic_micro_survey_shown", {
        survey_id: ecosystemSurvey.id,
        survey_title: ecosystemSurvey.title,
        trigger_surface: "ecosystem",
        starsailors_session_token: analyticsSessionToken,
      });
    }, SURVEY_DISPLAY_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [analyticsSessionToken, ecosystemSurvey, posthog, user]);

  const completeSurvey = async (answers: Record<string, string>) => {
    if (!user || !ecosystemSurvey) return;
    safeStorageSet(surveyStorageKey(ecosystemSurvey.id, user.id), "done");
    posthog?.capture("mechanic_micro_survey_submitted", {
      survey_id: ecosystemSurvey.id,
      survey_title: ecosystemSurvey.title,
      trigger_surface: "ecosystem",
      response_count: Object.keys(answers).length,
      q1: answers[ecosystemSurvey.questions[0].id] ?? null,
      q2: ecosystemSurvey.questions[1] ? answers[ecosystemSurvey.questions[1].id] ?? null : null,
      starsailors_session_token: analyticsSessionToken,
    });
    setShowSurvey(false);
  };

  const dismissSurvey = () => {
    if (!user || !ecosystemSurvey) return;
    safeStorageSet(surveyStorageKey(ecosystemSurvey.id, user.id), "done");
    posthog?.capture("mechanic_micro_survey_dismissed", {
      survey_id: ecosystemSurvey.id,
      trigger_surface: "ecosystem",
      starsailors_session_token: analyticsSessionToken,
    });
    setShowSurvey(false);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={() => {}}
        />
      </div>

      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />

      <main className="pt-24 px-4 sm:px-6 pb-10">
        <section className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/10 via-slate-950/85 to-cyan-950/65 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-violet-200/85">Ecosystem Command</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">Star Sailors Mission Network</h1>
            <p className="mt-2 text-sm sm:text-base text-violet-100/80 max-w-3xl">
              A single progression network across web missions and field simulations. Your discoveries, upgrades, and referrals carry across surfaces.
            </p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Link href="/game" className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-4 hover:bg-cyan-500/20 transition-colors">
                <p className="flex items-center gap-2 text-cyan-100 font-semibold">
                  <Microscope className="h-4 w-4" />
                  Live Web Missions
                </p>
                <p className="mt-1 text-xs text-cyan-100/75">
                  Telescope, rover, satellite, and solar classification loops.
                </p>
              </Link>

              <Link href="/research" className="rounded-xl border border-amber-300/30 bg-amber-500/10 p-4 hover:bg-amber-500/20 transition-colors">
                <p className="flex items-center gap-2 text-amber-100 font-semibold">
                  <Satellite className="h-4 w-4" />
                  Progression Systems
                </p>
                <p className="mt-1 text-xs text-amber-100/75">
                  Upgrade paths that will power cross-client mechanics.
                </p>
              </Link>

              <div className="rounded-xl border border-violet-300/30 bg-violet-500/10 p-4">
                <p className="flex items-center gap-2 text-violet-100 font-semibold">
                  <Gamepad2 className="h-4 w-4" />
                  Godot Prototypes
                </p>
                <p className="mt-1 text-xs text-violet-100/75">
                  Mining and planet-hunter field sims connected to this account.
                </p>
                <span className="mt-2 inline-flex rounded-full border border-violet-300/35 bg-violet-500/20 px-2 py-0.5 text-[11px] text-violet-100">
                  In rollout
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-violet-300/20 bg-violet-500/10 p-4">
              <p className="text-sm text-violet-100 font-medium flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Next Expansion Tracks
              </p>
              <ul className="mt-2 space-y-1 text-xs text-violet-100/80">
                <li className="flex items-center gap-2"><Pickaxe className="h-3.5 w-3.5" />Prospecting chain: web loadout to Godot extraction to web rewards.</li>
                <li className="flex items-center gap-2"><Rocket className="h-3.5 w-3.5" />Guild contracts: weekly collaborative targets across all surfaces.</li>
                <li className="flex items-center gap-2"><Satellite className="h-3.5 w-3.5" />Sector incidents: short-lived world-state modifiers and response missions.</li>
              </ul>
            </div>

            {showSurvey && ecosystemSurvey && (
              <div className="mt-5">
                <MechanicPulseSurvey
                  survey={ecosystemSurvey}
                  onSubmit={completeSurvey}
                  onDismiss={dismissSurvey}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
