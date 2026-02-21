"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoverBackground } from "@/src/components/classification/telescope/rover-background";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { usePageData } from "@/hooks/usePageData";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import { useAuthUser } from "@/src/hooks/useAuthUser";

const PLANETS = ["Mars"];

export default function DeployRoverPage() {
  const router = useRouter();
  const [selectedPlanet, setSelectedPlanet] = useState("Mars");
  const [waypoints, setWaypoints] = useState<{ x: number; y: number }[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  // Supabase session
  const { user } = useAuthUser();

  // Most recent planet classification and anomaly
  const [planetClassification, setPlanetClassification] = useState<any>(null);
  const [planetAnomaly, setPlanetAnomaly] = useState<any>(null);
  
  // Rover upgrade state
  const [maxWaypoints, setMaxWaypoints] = useState<number>(4);
  const [roverUpgrades, setRoverUpgrades] = useState<{ roverwaypoints: boolean; findMinerals: boolean }>({
    roverwaypoints: false,
    findMinerals: false,
  });

  useEffect(() => {
    async function loadRoverSetup() {
      if (!user) return;
      const response = await fetch("/api/gameplay/deploy/rover/setup", { cache: "no-store" });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        return;
      }

      setPlanetClassification(payload?.planetClassification ?? null);
      setPlanetAnomaly(payload?.planetAnomaly ?? null);
      setUserClassificationCount(payload?.userClassificationCount ?? 0);
      setIsFastDeployEnabled(Boolean(payload?.isFastDeployEnabled));
      setRoverUpgrades(
        payload?.roverUpgrades ?? {
          roverwaypoints: false,
          findMinerals: false,
        }
      );
      setMaxWaypoints(payload?.maxWaypoints ?? 4);

      if (payload?.hasExistingRoverDeployment) {
        router.replace("/game?view=rover");
      }
    }

    loadRoverSetup();
  }, [user, router]);

  const {
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    incompletePlanet,
    planetTargets,
    visibleStructures,
    loading,
  } = usePageData();

  const { isDark, toggleDarkMode } = UseDarkMode();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [deployMessage, setDeployMessage] = useState<string>("");
  const [userClassificationCount, setUserClassificationCount] = useState<number>(0);
  const [isFastDeployEnabled, setIsFastDeployEnabled] = useState<boolean>(false);
  const [showWaypointDetails, setShowWaypointDetails] = useState<boolean>(false);

  // Handle map click to add waypoint
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (waypoints.length >= maxWaypoints) return;
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setWaypoints([
      ...waypoints,
      { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 },
    ]);
  };

  const handleDeployRover = async () => {
    if (!user) {
      return;
    };

    setDeployMessage("");
    const response = await fetch("/api/gameplay/deploy/rover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ waypoints }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setDeployMessage(payload?.error || "Failed to deploy rover");
      return;
    }

    setDeployMessage("Rover deployed successfully!");
    setTimeout(() => {
      router.push("/game?view=rover");
    }, 2000);
  };

  // Draw lines between waypoints
  const renderLines = () => {
    if (waypoints.length < 2) return null;
    return (
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 2 }}
      >
        {waypoints.slice(1).map((pt, i) => {
          const prev = waypoints[i];
          return (
            <line
              key={i}
              x1={`${prev.x}%`}
              y1={`${prev.y}%`}
              x2={`${pt.x}%`}
              y2={`${pt.y}%`}
              stroke="#fff"
              strokeWidth={3}
              strokeDasharray="8 4"
              opacity={0.8}
            />
          );
        })}
      </svg>
    );
  };

  // Draw waypoint markers
  const renderWaypoints = () =>
    waypoints.map((pt, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-[#18dda1] border-2 border-white shadow-lg"
        style={{
          left: `calc(${pt.x}% - 16px)`,
          top: `calc(${pt.y}% - 16px)`,
          width: 32,
          height: 32,
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-xs text-white font-bold">{i + 1}</span>
      </div>
    ));

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-start bg-gradient-to-br from-[#1a0a0a] via-[#2c1a1a] to-[#1a1a2c]">
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={(anomaly) => console.log("Clicked anomaly:", anomaly)}
        />
      </div>
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => setNotificationsOpen((open) => !open)}
        activityFeed={activityFeed}
        otherClassifications={otherClassifications}
      />
  <div className="w-full max-w-screen-xl px-4 pt-24 pb-12 flex flex-row gap-6 items-start justify-center h-[calc(100vh-6rem)]">
        <div className="flex-1 flex flex-col items-center h-full">
          <h1 className="text-2xl font-bold text-white mb-4">Deploy Rover</h1>

          {/* Fast Deploy Welcome Message */}
          {isFastDeployEnabled && (
            <div className="mb-6 p-4 bg-gradient-to-br from-green-500/25 to-blue-500/25 rounded-lg border border-green-400/40 shadow-lg max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-semibold text-sm">🎁 Welcome Gift Active!</span>
              </div>
              <p className="text-green-200 text-xs leading-relaxed">
                🤖 As a new space explorer, your rover will experience a <strong>speed boost</strong>! 
                Your rover will reach waypoints in just <strong>60 seconds</strong> instead of the usual 1 hour, 
                and your mission will begin <strong>immediately</strong>. Happy exploring!
              </p>
            </div>
          )}

          <div className="mb-4 flex items-center gap-4">
            <label className="text-white font-medium">Select Planet:</label>
            <select
              value={selectedPlanet}
              onChange={(e) => setSelectedPlanet(e.target.value)}
              className="px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700"
              disabled
              style={{ minWidth: 120 }}
            >
              <option value="Mars">Mars</option>
            </select>
            <span className="text-zinc-400 text-xs">More planets/locations coming soon.</span>
          </div>

          {/* Fixed height map container */}
          <div
            className="relative w-full max-w-xl rounded-2xl overflow-hidden border border-zinc-700 shadow-2xl flex-shrink-0"
            ref={mapRef}
            onClick={handleMapClick}
            style={{ 
              cursor: waypoints.length < maxWaypoints ? "crosshair" : "not-allowed", 
              background: "rgba(30,20,20,0.7)",
              height: "420px",
              minHeight: "420px",
              maxHeight: "420px"
            }}
          >
            <RoverBackground variant="martian-surface" />
            {renderLines()}
            {renderWaypoints()}
          </div>

          {/* Compact waypoint summary (no large coordinate list) */}
          <div className="w-full max-w-xl mt-6 px-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-white font-semibold">Waypoints</h2>
              <div className="text-sm text-zinc-400">Max: {maxWaypoints}</div>
            </div>

            {/* Rover Upgrade Notification (compact) */}
            {roverUpgrades.roverwaypoints && (
              <div className="mb-3 mt-2 p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20 text-xs text-blue-200">
                🛞 Navigation Upgrade active — you can place up to {maxWaypoints} waypoints.
              </div>
            )}

            {roverUpgrades.findMinerals && (
              <div className="mb-3 mt-2 p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/20 text-xs text-blue-200">
                🪨 Minerals Upgrade active - your rovers can now find mineral deposits on their adventures
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center mt-2">
              {waypoints.length > 0 ? (
                waypoints.map((pt, i) => (
                  <div
                    key={i}
                    title={`Waypoint ${i + 1}: X=${pt.x}, Y=${pt.y}`}
                    className="inline-flex items-center justify-center bg-[#18dda1] text-xs text-black font-semibold rounded-full w-8 h-8"
                  >
                    {i + 1}
                  </div>
                ))
              ) : (
                <div className="text-zinc-400">No waypoints selected — click on the map to add.</div>
              )}
              <div className="ml-auto text-sm text-zinc-300">Selected Location: <span className="font-semibold text-white">Mars</span></div>
            </div>

            {/* optional details toggle: coords are hidden by default to save space */}
            <div className="mt-3 flex items-center gap-3">
              <div className="text-xs text-zinc-400">Waypoints selected: <span className="text-white font-medium">{waypoints.length}</span></div>
              {waypoints.length > 0 && (
                <button
                  className="text-xs text-zinc-300 underline hover:text-white"
                  onClick={() => setShowWaypointDetails((s) => !s)}
                  type="button"
                >
                  {showWaypointDetails ? 'Hide coords' : 'Show coords'}
                </button>
              )}
            </div>

            {showWaypointDetails && (
              <div className="mt-2 text-xs text-zinc-300 bg-black/20 rounded p-2 max-h-40 overflow-auto">
                {waypoints.map((pt, i) => (
                  <div key={`d-${i}`}>Waypoint {i + 1}: X = {pt.x}, Y = {pt.y}</div>
                ))}
              </div>
            )}

            {deployMessage && (
              <div className="mt-4 text-center text-yellow-400 font-semibold text-md">
                {deployMessage}
              </div>
            )}
          </div>

          {/* Fixed action bar so Deploy button is always accessible */}
          <div className="w-full max-w-xl flex-shrink-0 py-4 flex justify-center">
            <button
              className="px-6 py-3 rounded bg-[#18dda1] text-white font-bold text-lg shadow-lg disabled:bg-zinc-700"
              disabled={waypoints.length < 2}
              onClick={handleDeployRover}
            >
              Deploy Rover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
