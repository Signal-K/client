"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import { GameSurveys } from "@/src/features/surveys/components/GameSurveys";
import { useUserPreferences, type ProjectType } from "@/src/hooks/useUserPreferences";

import { useGardenState } from "@/src/features/garden/useGardenState";
import { useSkyPhase } from "@/src/features/garden/useSkyPhase";
import { growthFor, hopById, structureById, type StructureId } from "@/src/features/garden/catalog";
import {
  gardenLesson,
  hasRaisedInstrument,
  projectsForStructures,
  shouldAskForProjectRoster,
  structuresFromAutomatons,
  structuresFromInventoryItems,
} from "@/src/features/garden/gardenLogic";
import { GardenScene } from "@/src/features/garden/components/GardenScene";
import { GardenHud } from "@/src/features/garden/components/GardenHud";
import { GardenPanel } from "@/src/features/garden/components/GardenPanel";
import { SkyClassify } from "@/src/features/garden/components/SkyClassify";
import styles from "@/src/features/garden/garden.module.css";
import type { MechanicId } from "@/src/features/surveys/types";
import type { ClassificationForMechanicSurvey } from "@/src/features/surveys/hooks/useGameSurveys";

// The garden panel opens on `ssc.*` catalog ids; MECHANIC_SURVEYS still
// speaks the pre-garden bare-word vocabulary. Structures with no citizen-
// science minigame (habitat, hydro, pad, probe) have no mechanic survey and
// map to undefined on purpose.
const STRUCTURE_TO_MECHANIC_ID: Partial<Record<StructureId, MechanicId>> = {
  "ssc.structure.telescope": "telescope",
  "ssc.structure.satellite": "satellite",
  "ssc.structure.solar": "solar",
  "ssc.structure.rover": "rover",
};

const CompleteProfileForm = dynamic(() => import("@/src/components/profile/setup/FinishProfile"), {
  loading: () => <div className="p-4 text-xs text-muted-foreground">Loading profile form…</div>,
});
const PWAPrompt = dynamic(() => import("@/src/components/pwa/PWAPrompt"), { loading: () => null });
const PushNotificationPrompt = dynamic(
  () => import("@/src/features/notifications/components/PushNotificationPrompt"),
  { ssr: false }
);

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface HubBootstrap {
  username: string | null;
  fullName: string | null;
  classificationPoints: number;
  inventoryItemIds: number[];
  automatons: string[];
  classificationCount: number;
  returning: boolean;
}

interface GameClientProps {
  initialData: unknown;
  user: { id?: string } | null;
}

export default function GameClient({ user }: GameClientProps) {
  const posthog = usePostHog();
  const garden = useGardenState(user?.id);
  const phase = useSkyPhase();
  const [layout, setLayout] = useState<"portrait" | "landscape">("portrait");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const {
    preferences,
    isLoading: prefsLoading,
    needsPreferencesPrompt,
    setProjectInterests,
    dismissPreferencesPrompt,
    hydrateFromAccount,
    showPreferencesPrompt,
    markTutorialComplete,
    hasTutorialCompleted,
  } = useUserPreferences(user?.id);
  const [classifications, setClassifications] = useState<ClassificationForMechanicSurvey[]>([]);
  const [accountLoading, setAccountLoading] = useState(true);
  const [bootstrap, setBootstrap] = useState<HubBootstrap | null>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    posthog?.capture("garden_hub_viewed", { userId: user?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setAccountLoading(false);
      return;
    }
    let cancelled = false;
    fetch("/api/gameplay/hub/bootstrap")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HubBootstrap | null) => {
        if (cancelled) return;
        setBootstrap(data);
      })
      .catch(() => {
        if (!cancelled) setBootstrap(null);
      })
      .finally(() => {
        if (!cancelled) setAccountLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!garden.hydrated || prefsLoading || accountLoading || seededRef.current) return;
    seededRef.current = true;
    const owned = bootstrap
      ? [
          ...structuresFromInventoryItems(bootstrap.inventoryItemIds ?? []),
          ...structuresFromAutomatons(bootstrap.automatons ?? []),
        ]
      : [];
    if (owned.length) garden.seedOwned(owned);
    const inferred = projectsForStructures(owned);
    const interests =
      preferences.projectInterests.length > 0 ? preferences.projectInterests : inferred;
    if (!preferences.hasCompletedOnboarding && bootstrap?.returning) {
      hydrateFromAccount({ interests, returning: true });
    }
    if (interests.length > 0) garden.applyProjects(interests);
    else if (bootstrap?.returning) {
      garden.applyProjects(["planet-hunting", "cloud-tracking", "rover-training", "solar-monitoring"]);
    }
  }, [accountLoading, bootstrap, garden, garden.hydrated, hydrateFromAccount, preferences.projectInterests, prefsLoading]);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    fetch(`/api/gameplay/classifications?author=${encodeURIComponent(user.id)}&limit=500`)
      .then((res) => (res.ok ? res.json() : { classifications: [] }))
      .then((data) => {
        if (!cancelled) setClassifications(data.classifications ?? []);
      })
      .catch(() => {
        if (!cancelled) setClassifications([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const sync = () => setLayout(mq.matches ? "landscape" : "portrait");
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else mq.removeListener(sync);
    };
  }, []);

  const handleDeferredToast = useCallback(
    () => garden.pushToast("Pick this project in your roster to unlock the plot."),
    [garden]
  );

  const handleHopOut = useCallback(
    (hopId: string) => {
      const hop = hopById(hopId);
      if (hop) garden.hopOut(hop);
    },
    [garden]
  );

  const handleSaveProjects = useCallback(
    (prefs: ProjectType[]) => {
      setProjectInterests(prefs);
      garden.applyProjects(prefs);
      posthog?.capture("onboarding_completed", { userId: user?.id, projects: prefs });
    },
    [garden, posthog, setProjectInterests, user?.id]
  );

  const owned = bootstrap
    ? [
        ...structuresFromInventoryItems(bootstrap.inventoryItemIds ?? []),
        ...structuresFromAutomatons(bootstrap.automatons ?? []),
      ]
    : [];
  const showRoster = shouldAskForProjectRoster({
    prefsLoading,
    accountLoading,
    needsPreferencesPrompt,
    returning: !!bootstrap?.returning,
    hasInterests: (preferences.projectInterests?.length ?? 0) > 0 || owned.length > 0,
    hasRaisedInstrument: hasRaisedInstrument(garden.state),
  });

  const lesson = showRoster
    ? null
    : gardenLesson({
        state: garden.state,
        coachDone: hasTutorialCompleted("garden-first-session"),
        classifiedThisVisit: garden.classifiedThisVisit,
        classificationCount: bootstrap?.classificationCount ?? 0,
      });
  const lessonCopy =
    lesson === "raise"
      ? "Tap a dashed plot. Spend CR to raise one instrument."
      : lesson === "classify"
        ? "The sky is ready — tap the instrument to classify once."
        : lesson === "hop"
          ? "Garden is a launchpad. Hop to Landnam or Spectra for a longer session."
          : null;

  const habitat = garden.state.structures["ssc.structure.habitat"];
  const hydro = garden.state.structures["ssc.structure.hydro"];
  const bonusStage = growthFor(structureById("ssc.structure.habitat"), habitat?.tier || 1);
  const idleRate = (hydro?.tier || 1) + ((bonusStage?.capacity.idleBonus as number | undefined) || 0);

  if (!garden.hydrated) {
    return (
      <div className={styles.gardenPage}>
        <div className={styles.stage} />
      </div>
    );
  }

  return (
    <div className={styles.gardenPage}>
      <GardenScene state={garden.state} onOpen={garden.openStructure} layout={layout} phase={phase} userId={user?.id}>
        <GardenHud
          credits={garden.state.credits}
          phase={phase}
          username={bootstrap?.username}
          watered={garden.wateredThisVisit}
          idleRate={idleRate}
          onProfileClick={() => setShowProfileModal(true)}
          onProjectsClick={showPreferencesPrompt}
          onHopOut={handleHopOut}
        />
        <p className={cx(styles.hint, !!lessonCopy && styles.isOff)}>
          Pick a project, raise one instrument, classify once
        </p>
        {lessonCopy ? (
          <div className={styles.coach} role="status">
            {lessonCopy}
            {lesson === "hop" ? (
              <button type="button" onClick={() => markTutorialComplete("garden-first-session")}>
                Got it
              </button>
            ) : null}
          </div>
        ) : null}
        <div className={cx(styles.toast, !!garden.toast && styles.isOn)} role="status">
          {garden.toast}
        </div>

        <GardenPanel
          state={garden.state}
          openPanelId={garden.openPanelId}
          onClose={garden.closePanel}
          onTendHydro={garden.tendHydro}
          onSitHabitat={garden.sitHabitat}
          onUpgrade={garden.upgrade}
          onBuild={garden.build}
          onCollectFlight={garden.collectFlight}
          onStartMinigame={garden.startMinigame}
          onHopOut={handleHopOut}
          onDeferredToast={handleDeferredToast}
        />

        <SkyClassify
          openMinigame={garden.openMinigame}
          onCloseMinigame={garden.closeMinigame}
          onCompleteSkyClassify={garden.completeSkyClassify}
          probeGrainOpen={garden.probeGrainOpen}
          onCloseProbeGrain={garden.closeProbeGrain}
          onSendFlight={garden.sendFlight}
          onHopOut={handleHopOut}
        />
      </GardenScene>

      {!showRoster && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md">
          <GameSurveys
            userId={user?.id}
            classifications={classifications}
            mechanicId={garden.openPanelId ? STRUCTURE_TO_MECHANIC_ID[garden.openPanelId] : undefined}
          />
        </div>
      )}

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{bootstrap?.username ? "Profile" : "Finish profile"}</DialogTitle>
          </DialogHeader>
          <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
        </DialogContent>
      </Dialog>

      <ProjectPreferencesModal
        isOpen={showRoster}
        initialInterests={preferences?.projectInterests ?? []}
        onClose={dismissPreferencesPrompt}
        onSave={handleSaveProjects}
      />

      <PWAPrompt />
      <div className="fixed bottom-4 left-4 z-50 max-w-sm">
        <PushNotificationPrompt />
      </div>
    </div>
  );
}
