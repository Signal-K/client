"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { Button } from "@/src/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, Stars } from "@react-three/drei";
import Section from "@/src/components/sections/Section";
import { Sun } from "@/src/components/discovery/data-sources/Solar/Sun";
import { useRouter } from "next/navigation";

function Sun3D({ sunspots }: { sunspots: number }) {
  return (
    <>
      <Sun sunspots={sunspots} />
    </>
  );
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function SolarHealth() {
  const router = useRouter();
  const session = useSession();

  const [sunspotAnomalies, setSunspotAnomalies] = useState<any[]>([]);
  const [linkedSunspots, setLinkedSunspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [now, setNow] = useState(new Date());
  const [sunspots, setSunspots] = useState<number>(0);
  const automatonType = "TelescopeSolar";

  // Fetch anomalies and linked anomalies
  useEffect(() => {
    async function fetchSunspotData() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      // Fetch sunspot anomalies
      const anomaliesResponse = await fetch("/api/gameplay/anomalies?anomalySet=sunspot", {
        cache: "no-store",
      });
      const anomaliesPayload = await anomaliesResponse.json().catch(() => null);
      setSunspotAnomalies(anomaliesPayload?.anomalies || []);

      // Fetch linked anomalies
      const weekStart = getWeekStart(now).toISOString();
      const linkedResponse = await fetch(
        `/api/gameplay/linked-anomalies?automaton=${encodeURIComponent(automatonType)}&dateGte=${encodeURIComponent(weekStart)}`,
        { cache: "no-store" }
      );
      const linkedPayload = await linkedResponse.json().catch(() => null);
      setLinkedSunspots((linkedPayload?.linkedAnomalies || []).filter((l: any) => !isExpired(l)));

      // Fetch sunspot classifications for this user in the last week
      const countResponse = await fetch(
        `/api/gameplay/classifications/count?classificationtype=sunspot&createdAtGte=${encodeURIComponent(weekStart)}`,
        { cache: "no-store" }
      );
      const countPayload = await countResponse.json().catch(() => null);
      setSunspots(Number(countPayload?.count ?? 0));

      setLoading(false);
    }
    fetchSunspotData();
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, [session, now]);

  // Helper: is anomaly unlocked
  function isUnlocked(linked: any) {
    if (!linked) return false;
    // Use unlocked column if present, otherwise fallback to time logic
    if (typeof linked.unlocked === 'boolean') {
      return linked.unlocked;
    }
    if (!linked?.date) return false;
    const unlockTime = new Date(linked.date);
    unlockTime.setHours(unlockTime.getHours() + 1); // 1 hour unlock
    return now >= unlockTime;
  }
  // Helper: is anomaly expired
  function isExpired(linked: any) {
    if (!linked?.date) return false;
    const expireTime = new Date(linked.date);
    expireTime.setDate(expireTime.getDate() + 3);
    return now >= expireTime;
  }

  // Handle participate
  async function handleParticipate() {
    setParticipating(true);
    const response = await fetch("/api/gameplay/deploy/solar", { method: "POST" });
    const payload = await response.json().catch(() => null);
    setParticipating(false);
    if (!response.ok) {
      console.error("Error joining solar mission:", payload?.error || response.statusText);
      return;
    }
    // Refresh
    const weekStart = getWeekStart(now).toISOString();
    const linkedResponse = await fetch(
      `/api/gameplay/linked-anomalies?automaton=${encodeURIComponent(automatonType)}&dateGte=${encodeURIComponent(weekStart)}`,
      { cache: "no-store" }
    );
    const linkedPayload = await linkedResponse.json().catch(() => null);
    setLinkedSunspots((linkedPayload?.linkedAnomalies || []).filter((l: any) => !isExpired(l)));
  }

  // Find first linked sunspot anomaly for this week
  const activeLinked = linkedSunspots.length > 0 ? linkedSunspots[0] : null;
  const unlocked = activeLinked && isUnlocked(activeLinked);
  const expired = activeLinked && isExpired(activeLinked);
  const anomalyId = activeLinked?.anomaly_id;

  // Solar stats
  const solarActivity = sunspotAnomalies.length > 0 ? "Active" : "Normal";
  const sunspotForming = sunspotAnomalies.length > 0;
  const sunspotCount = sunspotAnomalies.length;
  const nextFlare = sunspotForming
    ? `${Math.floor(Math.random() * 3) + 1} days`
    : "N/A";

  return (
    <Section
        sectionId="solar-health"
        variant="viewport"
        backgroundType="inner-solar"
        infoText={"Investigate star activity to detect solar flares and measure the intensity of sunspots"}
        expandLink={"/viewports/solar"}
        className="h-full"
      >
      <div className="relative w-full h-64 md:h-96 flex items-center justify-center py-8 md:py-12">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-zinc-400">Loading solar data...</p>
            </div>
          </div>
        ) : (
          <>
        {/* 3D Sun Scene */}
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center pl-8"
          style={{ width: "40%", minWidth: 180 }}
        >
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            className="w-full h-full"
          >
            <ambientLight intensity={0.7} />
            <pointLight position={[0, 0, 10]} intensity={2} color="#FFD700" />
            <Suspense fallback={null}>
              <Sun3D sunspots={sunspots} />
            </Suspense>
            <Stars
              radius={10}
              depth={20}
              count={100}
              factor={0.5}
              saturation={0.5}
              fade
              speed={1}
            />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={true}
            />
          </Canvas>
        </div>
        {/* Info and actions */}
        <div
          className="relative z-10 flex flex-col items-center justify-center h-full w-full px-2 md:px-6"
          style={{ marginLeft: "40%" }}
        >
          <div className="w-full flex flex-col items-center justify-center">
            <h2 className="text-lg md:text-xl font-bold mb-2 text-center">
              Solar Health
            </h2>
            {/* Show tutorial text only if button says 'Participate' (no deployment, sunspot forming, not participating) */}
            {!activeLinked && sunspotForming && !participating ? (
              <div className="w-full max-w-xl mx-auto">
                <p className="text-xs md:text-sm text-center mb-3 leading-relaxed break-words"
                  style={{
                    color: '#e4eff0',
                    background: 'rgba(30,30,40,0.7)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                  }}>
                  Each week, the sun undergoes new activity. Participate in the solar mission to monitor sunspots and help count solar anomalies. When a sunspot forms, you can classify and count it for science rewards. Sunspot events unlock after 1 hour and expire after 3 days.
                </p>
              </div>
            ) : null}
            {/* Show solar stats only if deployment exists or user is participating (i.e. button does NOT say 'Participate') */}
            {(activeLinked || participating || !sunspotForming) && (
              <div className="mt-2 flex flex-col items-center gap-1 w-full max-w-xs mx-auto">
                <span className="font-mono text-sm text-center">
                  Solar Activity: <span className="font-bold">{solarActivity}</span>
                </span>
                <span className="font-mono text-xs text-center">
                  Sunspots forming: {sunspotForming ? "Yes" : "No"}
                </span>
                <span className="font-mono text-xs text-center">
                  Sunspot count: {sunspotCount}
                </span>
                <span className="font-mono text-xs text-center">
                  Next flare: {nextFlare}
                </span>
              </div>
            )}
          </div>
          {/* Mission description and participate button if not yet joined */}
          {!loading && !activeLinked && (
            <div className="w-full flex flex-col items-center justify-center">
              <Button
                className="mt-4 w-36 text-xs"
                onClick={handleParticipate}
                disabled={participating || !sunspotForming}
                data-tutorial="participate-solar"
              >
                {participating
                  ? "Joining..."
                  : sunspotForming
                  ? "Participate"
                  : "No Sunspot Mission Available"}
              </Button>
            </div>
          )}
          {/* Unlocked sunspot: allow counting */}
          {unlocked && anomalyId && !expired && (
            <Button
              className="mt-3 w-36 text-xs"
              variant="outline"
              onClick={() => router.push(`/structures/telescope/sunspot/db-${anomalyId}/count`)}
            >
              Count Solar Anomalies
            </Button>
          )}
          {/* Status messages */}
          {activeLinked && !unlocked && !expired && (
            <span className="mt-2 text-xs text-center">
              Sunspot forming... Available for classification in{" "}
              {Math.max(
                0,
                1 -
                  Math.floor(
                    (now.getTime() - new Date(activeLinked.date).getTime()) /
                      3600000
                  )
              )}{" "}
              hour{Math.max(
                0,
                1 -
                  Math.floor(
                    (now.getTime() - new Date(activeLinked.date).getTime()) /
                      3600000
                  )
              ) === 1 ? "" : "s"}
            </span>
          )}
          {expired && (
            <span className="mt-2 text-xs text-center">
              Sunspot event expired. Await next activity.
            </span>
          )}
        </div>
          </>
        )}
      </div>
    </Section>
  );
}
