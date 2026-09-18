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
import { hopById, type StructureId } from "@/src/features/garden/catalog";
import {
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
    () => garden.pushToast("Deferred on purpose (SSC-7)."),
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

  const showRoster = shouldAskForProjectRoster({
    prefsLoading,
    accountLoading,
    needsPreferencesPrompt,
    returning: !!bootstrap?.returning,
  });

  if (!garden.hydrated) {
    return (
      <div className={styles.gardenPage}>
        <div className={styles.stage} />
      </div>
    );
  }

  return (
    <div className={styles.gardenPage}>
      <GardenScene state={garden.state} onOpen={garden.openPanel} layout={layout} phase={phase}>
        <GardenHud
          credits={garden.state.credits}
          phase={phase}
          onProfileClick={() => setShowProfileModal(true)}
          onProjectsClick={showPreferencesPrompt}
        />
        <p className={styles.hint}>
          Pick projects, spend CR to raise instruments, classify to earn more
        </p>
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
            <DialogTitle>User Profile</DialogTitle>
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
