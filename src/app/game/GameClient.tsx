"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePostHog } from "posthog-js/react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import ProjectPreferencesModal from "@/src/components/onboarding/ProjectPreferencesModal";
import { GameSurveys } from "@/src/features/surveys/components/GameSurveys";
import { useUserPreferences } from "@/src/hooks/useUserPreferences";

import { useGardenState } from "@/src/features/garden/useGardenState";
import { useSkyPhase } from "@/src/features/garden/useSkyPhase";
import { hopById } from "@/src/features/garden/catalog";
import { GardenScene } from "@/src/features/garden/components/GardenScene";
import { GardenHud } from "@/src/features/garden/components/GardenHud";
import { GardenPanel } from "@/src/features/garden/components/GardenPanel";
import { SkyClassify } from "@/src/features/garden/components/SkyClassify";
import styles from "@/src/features/garden/garden.module.css";

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

interface GameClientProps {
  initialData: unknown;
  user: { id?: string } | null;
}

export default function GameClient({ user }: GameClientProps) {
  const posthog = usePostHog();
  const garden = useGardenState();
  const phase = useSkyPhase();
  const [layout, setLayout] = useState<"portrait" | "landscape">("portrait");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { preferences, needsPreferencesPrompt, setProjectInterests } = useUserPreferences();

  useEffect(() => {
    posthog?.capture("garden_hub_viewed", { userId: user?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <GardenHud credits={garden.state.credits} phase={phase} onProfileClick={() => setShowProfileModal(true)} />
        <p className={styles.hint}>Tap a tool (or the thing above it) — classify from the panel, in the sky</p>
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

      <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md">
        <GameSurveys userId={user?.id} mechanicId={garden.openPanelId ?? "garden"} />
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          <CompleteProfileForm onSuccess={() => setShowProfileModal(false)} />
        </DialogContent>
      </Dialog>

      <ProjectPreferencesModal
        isOpen={needsPreferencesPrompt}
        initialInterests={preferences?.projectInterests ?? []}
        onClose={() => {}}
        onSave={(prefs) => setProjectInterests(prefs)}
      />

      <PWAPrompt />
      <div className="fixed bottom-4 left-4 z-50 max-w-sm">
        <PushNotificationPrompt />
      </div>
    </div>
  );
}
