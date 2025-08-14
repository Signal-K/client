"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/src/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls, Stars } from "@react-three/drei";
import Section from "@/src/components/sections/Section";

function Sun3D() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          color="#ffe066"
          emissive="#ffd700"
          emissiveIntensity={2.2}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.18, 64, 64]} />
        <meshBasicMaterial
          color="#fff8b0"
          transparent
          opacity={0.22}
          blending={1}
        />
      </mesh>
    </group>
  );
}

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function SolarHealth() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [sunspotAnomalies, setSunspotAnomalies] = useState<any[]>([]);
  const [linkedSunspots, setLinkedSunspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [now, setNow] = useState(new Date());
  const automatonType = "TelescopeSolar";

  // Fetch anomalies and linked anomalies
  useEffect(() => {
    setLoading(true);
    async function fetchSunspotData() {
      if (!session?.user?.id) return;
      const { data: anomalies } = await supabase
        .from("anomalies")
        .select("*")
        .eq("anomalySet", "sunspot");
      setSunspotAnomalies(anomalies || []);
      const weekStart = getWeekStart(now).toISOString();
      const { data: linked } = await supabase
        .from("linked_anomalies")
        .select("*")
        .eq("author", session.user.id)
        .eq("automaton", automatonType)
        .gte("date", weekStart);
      setLinkedSunspots((linked || []).filter((l) => !isExpired(l)));
      setLoading(false);
    }
    fetchSunspotData();
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, [session, supabase, now]);

  // Helper: is anomaly unlocked
  function isUnlocked(linked: any) {
    if (!linked) return false;
    // Use unlocked column if present, otherwise fallback to time logic
    if (typeof linked.unlocked === 'boolean') {
      return linked.unlocked;
    }
    if (!linked?.date) return false;
    const unlockTime = new Date(linked.date);
    unlockTime.setDate(unlockTime.getDate() + 1);
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
    for (const anomaly of sunspotAnomalies) {
      await supabase.from("linked_anomalies").insert({
        author: session?.user.id,
        anomaly_id: anomaly.id,
        automaton: automatonType,
        unlocked: false,
        date: now.toISOString(),
      });
    }
    setParticipating(false);
    // Refresh
    const weekStart = getWeekStart(now).toISOString();
    const { data: linked } = await supabase
      .from("linked_anomalies")
      .select("*")
      .eq("author", session?.user.id)
      .eq("automaton", automatonType)
      .gte("date", weekStart);
    setLinkedSunspots((linked || []).filter((l) => !isExpired(l)));
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
    >
      <div className="relative w-full h-64 md:h-96 flex items-center justify-center py-12 md:py-20">
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
              <Sun3D />
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
            <h2 className="text-2xl md:text-3xl font-bold text-yellow-200 drop-shadow-lg mb-3 text-center">
              Solar Health
            </h2>
            <div className="w-full max-w-xl mx-auto">
              <p className="text-yellow-100 text-base md:text-lg text-center drop-shadow mb-4 leading-relaxed break-words">
                Each week, the sun undergoes new activity. Participate in the
                solar mission to monitor sunspots and help count solar
                anomalies. When a sunspot forms, you can classify and count it
                for science rewards. Sunspot events unlock after 1 day and
                expire after 3 days.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 w-full max-w-xs mx-auto">
            <span className="text-yellow-300 font-mono text-lg text-center">
              Solar Activity: <span className="font-bold">{solarActivity}</span>
            </span>
            <span className="text-orange-200 font-mono text-sm text-center">
              Sunspots forming: {sunspotForming ? "Yes" : "No"}
            </span>
            <span className="text-orange-200 font-mono text-sm text-center">
              Sunspot count: {sunspotCount}
            </span>
            <span className="text-orange-200 font-mono text-sm text-center">
              Next flare: {nextFlare}
            </span>
          </div>
          {/* Mission description and participate button if not yet joined */}
          {!loading && !activeLinked && (
            <div className="w-full flex flex-col items-center justify-center">
              <Button
                className="mt-6 w-44"
                onClick={handleParticipate}
                disabled={participating || !sunspotForming}
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
              className="mt-4 w-44"
              variant="outline"
              onClick={() =>
                (window.location.href = `/structures/telescope/sunspot/db-${anomalyId}/count`)
              }
            >
              Count Solar Anomalies
            </Button>
          )}
          {/* Status messages */}
          {activeLinked && !unlocked && !expired && (
            <span className="mt-2 text-yellow-200 text-sm text-center">
              Sunspot forming... Available for classification in{" "}
              {Math.max(
                0,
                24 -
                  Math.floor(
                    (now.getTime() - new Date(activeLinked.date).getTime()) /
                      3600000
                  )
              )}{" "}
              hours
            </span>
          )}
          {expired && (
            <span className="mt-2 text-orange-400 text-sm text-center">
              Sunspot event expired. Await next activity.
            </span>
          )}
        </div>
      </div>
    </Section>
  );
};