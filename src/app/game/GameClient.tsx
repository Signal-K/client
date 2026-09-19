"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { GardenCoach, GardenOnboarding } from "@/src/features/garden/components/GardenOnboarding";
import { GameSurveys } from "@/src/features/surveys/components/GameSurveys";
import { useUserPreferences, type ProjectType } from "@/src/hooks/useUserPreferences";

import { captureCrossGameNavigation } from "@/src/features/analytics/cross-game-navigation";
import { useGardenState } from "@/src/features/garden/useGardenState";
import { useSkyPhase } from "@/src/features/garden/useSkyPhase";
import { hopById, hopSlugFromReturnParam, type StructureId } from "@/src/features/garden/catalog";
import {
  BUILDABLE_STRUCTURE_IDS,
  needsGardenOnboarding,
  shouldAskForProjectRoster,
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
  const [rosterReopened, setRosterReopened] = useState(false);
  const {
    preferences,
    isLoading: prefsLoading,
    needsPreferencesPrompt,
    setProjectInterests,
    hydrateFromAccount,
  } = useUserPreferences(user?.id);
  const [classifications, setClassifications] = useState<ClassificationForMechanicSurvey[]>([]);
  const [accountLoading, setAccountLoading] = useState(true);
  const [bootstrap, setBootstrap] = useState<HubBootstrap | null>(null);

  useEffect(() => {
    posthog?.capture("garden_hub_viewed", { userId: user?.id });
    posthog?.capture("game_hub_viewed", { userId: user?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!garden.hydrated) return;
    const from = hopSlugFromReturnParam(new URLSearchParams(window.location.search).get("from"));
    if (!from) return;
    const awarded = garden.claimReturnBonus(from);
    if (awarded) {
      captureCrossGameNavigation(posthog, {
        destination: "garden",
        source_section: "garden_return",
        user_id: user?.id,
        hop_id: from,
        bonus_cr: awarded,
        direction: "in",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garden.hydrated]);

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
      if (!hop) return;
      const awarded = garden.hopOut(hop);
      captureCrossGameNavigation(posthog, {
        destination: hop.id.replace("ssc.hop.", ""),
        source_section: "garden_hub",
        user_id: user?.id,
        hop_id: hop.id,
        bonus_cr: awarded,
        direction: "out",
      });
      posthog?.capture("garden_hop_clicked", {
        hop_id: hop.id,
        structure: garden.openPanelId,
        bonus_cr: awarded,
        userId: user?.id,
      });
    },
    [garden, posthog, user?.id]
  );

  const handleSaveProjects = useCallback(
    (prefs: ProjectType[]) => {
      setProjectInterests(prefs);
      garden.applyProjects(prefs);
      setRosterReopened(false);
      posthog?.capture("onboarding_completed", { userId: user?.id, projects: prefs });
    },
    [garden, posthog, setProjectInterests, user?.id]
  );

  const showRoster = shouldAskForProjectRoster({
    prefsLoading,
    accountLoading,
    gardenPristine: needsGardenOnboarding(garden.state),
  });

  const hasPlot = Object.values(garden.state.structures).some((rec) => rec.locked && rec.buildable);
  const raisedAny = BUILDABLE_STRUCTURE_IDS.some((id) => !garden.state.structures[id]?.locked);
  const coachMessage =
    showRoster || raisedAny || garden.placingId
      ? null
      : hasPlot
        ? "Tap a glowing plot, then choose where to raise it."
        : null;

  if (!garden.hydrated) {
    return (
      <div className={styles.gardenPage}>
        <div className={styles.stage} />
      </div>
    );
  }

  return (
    <div className={styles.gardenPage}>
      <GardenScene
        state={garden.state}
        onOpen={(id) => {
          posthog?.capture("garden_structure_opened", {
            structure: id,
            mechanic: STRUCTURE_TO_MECHANIC_ID[id],
            userId: user?.id,
          });
          garden.openPanel(id);
        }}
        layout={layout}
        phase={phase}
        placingId={garden.placingId}
        onPlace={(slot) => garden.placingId && garden.build(garden.placingId, slot)}
        onCancelPlace={garden.cancelPlace}
      >
        <GardenHud
          credits={garden.state.credits}
          phase={phase}
          username={bootstrap?.username}
          onProfileClick={() => setShowProfileModal(true)}
          onProjectsClick={() => setRosterReopened(true)}
          onHopOut={handleHopOut}
        />
        <p className={styles.hint}>
          Raise instruments on open ground, classify to earn credits, upgrade to grow
        </p>
        <GardenCoach message={coachMessage} />
        {garden.syncError && (
          <div
            role="alert"
            style={{
              position: "absolute",
              top: 88,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              maxWidth: "min(92vw, 420px)",
              padding: "8px 14px",
              borderRadius: 10,
              background: "rgba(120, 30, 30, 0.92)",
              color: "#fff",
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {garden.syncError}
          </div>
        )}
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
          onBeginPlace={garden.beginPlace}
          onCollectFlight={garden.collectFlight}
          onStartMinigame={(mg) => {
            posthog?.capture("garden_tool_opened", {
              minigame: mg.id,
              structure: mg.structure,
              mechanic: STRUCTURE_TO_MECHANIC_ID[mg.structure],
              userId: user?.id,
            });
            garden.startMinigame(mg);
          }}
          onHopOut={handleHopOut}
          onDeferredToast={handleDeferredToast}
        />

        <SkyClassify
          openMinigame={garden.openMinigame}
          onCloseMinigame={garden.closeMinigame}
          onCompleteSkyClassify={(structureId) => {
            posthog?.capture("garden_classify_completed", {
              structure: structureId,
              mechanic: STRUCTURE_TO_MECHANIC_ID[structureId],
              minigame: garden.openMinigame?.id,
              userId: user?.id,
            });
            garden.completeSkyClassify(structureId);
          }}
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
            mechanicId={
              garden.openPanelId && !garden.state.structures[garden.openPanelId]?.locked
                ? STRUCTURE_TO_MECHANIC_ID[garden.openPanelId]
                : undefined
            }
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

      <GardenOnboarding
        isOpen={showRoster || rosterReopened}
        credits={garden.state.credits}
        initialProjects={preferences.projectInterests}
        onSave={handleSaveProjects}
        onClose={showRoster ? undefined : () => setRosterReopened(false)}
      />

      <PWAPrompt />
      <div className="fixed bottom-4 left-4 z-50 max-w-sm">
        <PushNotificationPrompt />
      </div>
    </div>
  );
}
