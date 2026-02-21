"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { PlanetGeneratorMinimal } from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator";
import PlanetFocusView from "./PlanetFocusView";
import DeploySidebar from "./DeploySidebar";

type InvestigationMode = "weather" | "p-4" | "planets";

export type EnrichedDatabaseAnomaly = {
  id: number;
  content?: string | null;
  anomalySet?: string | null;
  stats?: {
    temperature?: number | string | null;
    radius?: number | string | null;
    density?: number | string | null;
    metallicity?: number | string | null;
    mass?: number | string | null;
    classificationId?: number | string | null;
    classificationAuthor?: string | null;
  } | null;
};

export default function DeploySatelliteViewport() {
  const session = useSession();

  const [mode, setMode] = useState<InvestigationMode>("planets");
  const [duration, setDuration] = useState(7);
  const [planetId, setPlanetId] = useState<number | null>(null);
  const [planets, setPlanets] = useState<EnrichedDatabaseAnomaly[]>([]);
  const [planetIndex, setPlanetIndex] = useState(0);
  const [selectedClassificationId, setSelectedClassificationId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [userCloudClassifications, setUserCloudClassifications] = useState(0);
  const [isFastDeployEnabled, setIsFastDeployEnabled] = useState<boolean | null>(null);

  const focusedPlanet = planets[planetIndex] ?? null;

  useEffect(() => {
    async function fetchInitialData() {
      if (!session?.user?.id) return;

      const [activeRes, planetRes, cloudRes, vortexRes, radarRes, totalRes] = await Promise.all([
        fetch(`/api/gameplay/active-planet?userId=${encodeURIComponent(session.user.id)}`),
        fetch("/api/gameplay/anomalies?anomalySet=telescope-tess&limit=500"),
        fetch("/api/gameplay/classifications/count?classificationtype=cloud"),
        fetch("/api/gameplay/classifications/count?classificationtype=vortex"),
        fetch("/api/gameplay/classifications/count?classificationtype=radar"),
        fetch("/api/gameplay/classifications/count"),
      ]);

      const activePayload = await activeRes.json().catch(() => ({}));
      const planetPayload = await planetRes.json().catch(() => ({}));
      const cloudPayload = await cloudRes.json().catch(() => ({}));
      const vortexPayload = await vortexRes.json().catch(() => ({}));
      const radarPayload = await radarRes.json().catch(() => ({}));
      const totalPayload = await totalRes.json().catch(() => ({}));

      const cloudCount = Number(cloudPayload?.count ?? 0);
      const vortexCount = Number(vortexPayload?.count ?? 0);
      const radarCount = Number(radarPayload?.count ?? 0);
      setUserCloudClassifications(cloudCount + vortexCount + radarCount);

      const totalClassifications = Number(totalPayload?.count ?? 0);
      setIsFastDeployEnabled(totalClassifications === 0);

      if (activeRes.ok && activePayload?.location) {
        setPlanetId(Number(activePayload.location));
      }
      if (planetRes.ok && Array.isArray(planetPayload?.anomalies)) {
        const list = planetPayload.anomalies as EnrichedDatabaseAnomaly[];
        setPlanets(list);
        if (list.length > 0) {
          const activeIdx = list.findIndex((p) => Number(p.id) === Number(activePayload?.location));
          setPlanetIndex(activeIdx >= 0 ? activeIdx : 0);
        }
      }
    }

    void fetchInitialData();
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchFocusedClassification() {
      if (!session?.user?.id || !focusedPlanet?.id) {
        setSelectedClassificationId(null);
        return;
      }

      const res = await fetch(
        `/api/gameplay/classifications?author=${encodeURIComponent(session.user.id)}&anomaly=${focusedPlanet.id}&classificationtype=planet&orderBy=created_at&ascending=false&limit=1`
      );
      const payload = await res.json().catch(() => ({}));
      const cls = res.ok ? payload?.classifications?.[0] : null;
      setSelectedClassificationId(cls?.id ? String(cls.id) : null);
    }

    void fetchFocusedClassification();
  }, [session?.user?.id, focusedPlanet?.id]);

  const selectedPlanetId = useMemo(() => focusedPlanet?.id ?? planetId, [focusedPlanet?.id, planetId]);

  const hasValidStats = Boolean(
    focusedPlanet?.stats?.radius &&
      focusedPlanet?.stats?.radius !== "N/A" &&
      focusedPlanet?.stats?.density &&
      focusedPlanet?.stats?.density !== "N/A"
  );

  const canDiscoverMinerals = hasValidStats && userCloudClassifications > 0;

  const deploymentWarning =
    mode === "p-4" && !hasValidStats
      ? "Wind Survey requires a planet with measured radius and density."
      : null;

  const cloudInvestigationDescription =
    userCloudClassifications >= 2
      ? "Advanced weather sweep: radar clouds, terrestrial clouds, and gaseous planet vortices."
      : "Baseline weather sweep: terrestrial cloud survey.";

  async function handleDeploy() {
    if (!selectedPlanetId) return;

    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/gameplay/deploy/satellite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investigationMode: mode,
          planetId: selectedPlanetId,
          duration,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Failed to deploy satellite");
      setMessage(`Deployment successful (${mode})`);
    } catch (error: any) {
      setMessage(error?.message || "Deployment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 rounded-xl border border-white/10 bg-[#0b1220] p-4 text-white">
      <div className="rounded-lg border border-white/10 bg-[#111827] p-3 min-h-[520px]">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Planet Focus</h3>
          <div className="text-xs text-white/70">
            {focusedPlanet ? `Planet ${planetIndex + 1} of ${planets.length}` : "No planets"}
          </div>
        </div>

        {focusedPlanet ? (
          <div className="relative h-[440px] rounded-lg border border-white/10 bg-[#0b1220] overflow-hidden">
            <PlanetFocusView
              planet={focusedPlanet}
              onPrev={() => setPlanetIndex((prev) => Math.max(0, prev - 1))}
              onNext={() => setPlanetIndex((prev) => Math.min(planets.length - 1, prev + 1))}
              isFirst={planetIndex <= 0}
              isLast={planetIndex >= planets.length - 1}
            />

            {selectedClassificationId ? (
              <div className="pointer-events-none absolute right-2 top-2 h-28 w-28 overflow-hidden rounded-lg border border-white/20 bg-black/40">
                <PlanetGeneratorMinimal classificationId={selectedClassificationId} hideBackground hideSky />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="h-[440px] flex items-center justify-center text-sm text-white/70 rounded-lg border border-white/10 bg-[#0b1220]">
            No classified planet selected yet.
          </div>
        )}
      </div>

      <div className="rounded-lg border border-white/10 bg-[#111827] p-0 overflow-hidden">
        <DeploySidebar
          investigationMode={mode}
          setInvestigationMode={setMode}
          duration={duration}
          setDuration={setDuration}
          onDeploy={handleDeploy}
          isDeploying={submitting}
          cloudInvestigationDescription={cloudInvestigationDescription}
          userCloudClassifications={userCloudClassifications}
          isDeployDisabled={!selectedPlanetId || Boolean(deploymentWarning)}
          deploymentWarning={deploymentWarning}
          isFastDeployEnabled={isFastDeployEnabled}
          waterDiscoveryStatus={{
            hasCloudClassifications: userCloudClassifications > 0,
            hasValidStats,
            canDiscoverMinerals,
          }}
        />

        <div className="border-t border-white/10 px-4 py-3 text-sm text-white/80">
          <div>Selected planet ID: {selectedPlanetId ?? "loading..."}</div>
          {message ? <div className="mt-2 text-cyan-300">{message}</div> : null}
        </div>
      </div>
    </div>
  );
}
