"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import Link from "next/link";
import { Wrench, Wifi } from "lucide-react";
import TelescopeIcon from "@/src/components/icons/TelescopeIcon";
import SatelliteIcon from "@/src/components/icons/SatelliteIcon";
import RoverIcon from "@/src/components/icons/RoverIcon";
import StardustBalance from "@/src/components/stardust/StardustBalance";
import PlanetSelectorModal from "@/src/components/modals/PlanetSelectorModal";
import useDeploymentStatus from "@/src/hooks/useDeploymentStatus";
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar";
import { cn } from "@/src/shared/utils";

// ─── HUD corner bracket ────────────────────────────────────────────────────────
function HudCorner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return (
    <div
      className={cn(
        "absolute w-4 h-4 pointer-events-none",
        pos === "tl" && "top-2.5 left-2.5 border-t border-l",
        pos === "tr" && "top-2.5 right-2.5 border-t border-r",
        pos === "bl" && "bottom-2.5 left-2.5 border-b border-l",
        pos === "br" && "bottom-2.5 right-2.5 border-b border-r",
      )}
      style={{ borderColor: "rgba(136,192,208,0.45)" }}
      aria-hidden
    />
  );
}

// ─── Animated 3D orbit ring + satellite dot ────────────────────────────────────
function OrbitRing({
  size,
  tiltX,
  tiltZ,
  period,
  color,
  reverse,
  showDot,
  dotColor,
  dotGlow,
}: {
  size: number;        // px diameter of the ring
  tiltX: number;       // deg, rotateX to tilt into perspective
  tiltZ: number;       // deg, rotateZ to rotate the orbital plane
  period: number;      // seconds for one orbit
  color: string;       // ring border color rgba
  reverse?: boolean;
  showDot?: boolean;
  dotColor?: string;
  dotGlow?: string;
}) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        width: size,
        height: size,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
        borderRadius: "50%",
        border: `1px solid ${color}`,
        transform: `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`,
        animation: `spinOrbit ${period}s linear infinite ${reverse ? "reverse" : ""}`,
        transformStyle: "preserve-3d",
      }}
    >
      {showDot && (
        <div
          className="absolute"
          style={{
            top: -3,
            left: "50%",
            marginLeft: -3,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dotColor ?? "white",
            boxShadow: dotGlow ?? `0 0 6px ${dotColor}`,
          }}
        />
      )}
    </div>
  );
}

// ─── Surface beacon (telescope / rover on the planet) ─────────────────────────
function SurfaceBeacon({
  deployed,
  hasSignals,
  signalCount,
  label,
  icon,
  href,
  onClick,
  accentColor,
  glowColor,
}: {
  deployed: boolean;
  hasSignals: boolean;
  signalCount: number;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  accentColor: string;
  glowColor: string;
}) {
  const content = (
    <div className="flex flex-col items-center gap-1 cursor-pointer group select-none">
      {/* Beacon tower */}
      <div className="relative flex flex-col items-center">
        {/* Pulse ring when active */}
        {deployed && (
          <span
            className="absolute inset-0 rounded-full animate-ping pointer-events-none"
            style={{
              inset: hasSignals ? "-12px" : "-8px",
              background: `radial-gradient(circle, ${glowColor.replace("X", hasSignals ? "0.25" : "0.12")} 0%, transparent 70%)`,
              animationDuration: hasSignals ? "1.8s" : "3s",
            }}
          />
        )}

        {/* Orbit ring decoration around icon */}
        {deployed && (
          <div
            className="absolute rounded-full border pointer-events-none"
            style={{
              inset: "-7px",
              borderColor: hasSignals
                ? "rgba(251,191,36,0.4)"
                : glowColor.replace("X", "0.3"),
              animation: "pulse-slow 3s ease-in-out infinite",
            }}
          />
        )}

        {/* Icon pod */}
        <div
          className="relative w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300"
          style={{
            borderColor: deployed
              ? hasSignals
                ? "rgba(251,191,36,0.7)"
                : glowColor.replace("X", "0.6")
              : "rgba(255,255,255,0.08)",
            background: deployed
              ? hasSignals
                ? "rgba(251,191,36,0.12)"
                : glowColor.replace("X", "0.1")
              : "rgba(0,0,0,0.3)",
            boxShadow: deployed
              ? hasSignals
                ? "0 0 16px rgba(251,191,36,0.4), inset 0 0 8px rgba(251,191,36,0.08)"
                : `0 0 14px ${glowColor.replace("X", "0.35")}, inset 0 0 8px ${glowColor.replace("X", "0.06")}`
              : "none",
          }}
        >
          {icon}
        </div>
      </div>

      {/* Ground shadow — Pokémon GO-style placement indicator */}
      <div
        className="w-7 h-1 rounded-full"
        style={{
          background: deployed
            ? hasSignals
              ? "rgba(251,191,36,0.35)"
              : glowColor.replace("X", "0.3")
            : "rgba(255,255,255,0.06)",
          boxShadow: deployed
            ? hasSignals
              ? "0 0 10px rgba(251,191,36,0.5)"
              : `0 0 10px ${glowColor.replace("X", "0.4")}`
            : "none",
        }}
        aria-hidden
      />

      {/* Label */}
      <div className="text-center mt-0.5">
        <div
          className="font-mono text-[8px] uppercase tracking-[0.15em] leading-none"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {label}
        </div>
        <div
          className="font-mono text-[7px] leading-none mt-0.5"
          style={{
            color: hasSignals
              ? "#fbbf24"
              : deployed
                ? glowColor.replace("X", "0.9")
                : "rgba(255,255,255,0.18)",
          }}
        >
          {hasSignals ? `${signalCount} SIG` : deployed ? "ACTIVE" : "STANDBY"}
        </div>
      </div>
    </div>
  );

  if (onClick) return <button onClick={onClick} className="outline-none">{content}</button>;
  if (href) return <Link href={href}>{content}</Link>;
  return <div>{content}</div>;
}

// ─── Telemetry data line ──────────────────────────────────────────────────────
function TelemetryLine({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[7px] uppercase tracking-widest" style={{ color: "rgba(136,192,208,0.35)" }}>
        {label}
      </span>
      <span className="font-mono text-[8px] tabular-nums" style={{ color: color ?? "rgba(255,255,255,0.45)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ActivityHeader({
  location,
}: {
  landmarksExpanded: boolean;
  onToggleLandmarks: () => void;
  scrolled: boolean;
  location?: string;
}) {
  const session = useSession();

  const [profile, setProfile] = useState<{ username: string | null } | null>(null);
  const [deploymentMessage, setDeploymentMessage] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPlanetSelector, setShowPlanetSelector] = useState(false);
  const [classificationsCount, setClassificationsCount] = useState<number>(0);
  const [availableUpgrades, setAvailableUpgrades] = useState<number>(0);
  const [bothUpgradesUnlocked, setBothUpgradesUnlocked] = useState<boolean>(false);
  const [missionElapsed, setMissionElapsed] = useState("00:00:00");

  // Mission elapsed timer (time since UTC midnight, as a "mission clock")
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      setMissionElapsed(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchData = async () => {
      const [pageRes, researchRes] = await Promise.all([
        fetch("/api/gameplay/page-data", { cache: "no-store" }),
        fetch("/api/gameplay/research/summary", { cache: "no-store" }),
      ]);
      const pagePayload = await pageRes.json().catch(() => null);
      const researchPayload = await researchRes.json().catch(() => null);
      if (pageRes.ok && pagePayload) setProfile(pagePayload.profile ?? null);
      if (researchRes.ok && researchPayload) {
        setClassificationsCount(Number(researchPayload?.counts?.all ?? 0));
        const techTypes: string[] = Array.isArray(researchPayload?.researchedTechTypes)
          ? researchPayload.researchedTechTypes
          : [];
        const hasT = techTypes.includes("probereceptors") || Number(researchPayload?.upgrades?.telescopeReceptors ?? 1) > 1;
        const hasS = techTypes.includes("satellitecount") || Number(researchPayload?.upgrades?.satelliteCount ?? 1) > 1;
        setBothUpgradesUnlocked(hasT && hasS);
        setAvailableUpgrades(hasT && hasS ? 1 : (!hasT ? 1 : 0) + (!hasS ? 1 : 0));
      }
    };
    fetchData();
  }, [session]);

  const { deploymentStatus, planetTargets } = useDeploymentStatus();

  const handleSendSatellite = async (planetId: number, planetName: string) => {
    if (!session) return;
    try {
      const res = await fetch("/api/gameplay/deploy/satellite/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planetClassificationId: planetId }),
      });
      if (!res.ok) return;
      setDeploymentMessage(`Satellite deployed to ${planetName}`);
      setIsAnimating(true);
      setShowPlanetSelector(false);
      setTimeout(() => { setDeploymentMessage(""); setIsAnimating(false); }, 4000);
      setTimeout(() => { if (typeof window !== "undefined") window.location.reload(); }, 2000);
    } catch {}
  };

  const getBackgroundImage = (loc?: string) => {
    const map: Record<string, string> = {
      earth:   "/assets/Backdrops/Earth.png",
      mercury: "/assets/Backdrops/Mercury.png",
      venus:   "/assets/Backdrops/Venus.png",
      gas:     "/assets/Backdrops/gasgiant.jpeg",
    };
    return map[loc?.toLowerCase() ?? ""] ?? "/assets/Backdrops/Earth.png";
  };

  const displayName =
    profile?.username ||
    (session?.user?.is_anonymous ? "Guest" : session?.user?.email?.split("@")[0]) ||
    "Commander";

  const uid = session?.user?.id ?? "default";
  const ra  = ((uid.charCodeAt(0) * 137 + (uid.charCodeAt(1) || 65) * 31) % 3600) / 10;
  const dec = (((uid.charCodeAt(2) || 65) * 53) % 900) / 10 - 45;

  const totalSignals =
    deploymentStatus.telescope.unclassifiedCount +
    deploymentStatus.satellites.unclassifiedCount +
    deploymentStatus.rover.unclassifiedCount;

  return (
    <>
      <style>{`
        @keyframes spinOrbit {
          from { transform: rotateX(var(--tilt-x, 72deg)) rotateZ(0deg); }
          to   { transform: rotateX(var(--tilt-x, 72deg)) rotateZ(360deg); }
        }
        @keyframes scanDown {
          0%   { top: -1px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes planetDrift {
          0%   { background-position: 50% 50%; }
          50%  { background-position: 53% 50%; }
          100% { background-position: 50% 50%; }
        }
        .hud-scan-line { animation: scanDown 10s linear infinite; }
        .planet-drift  { animation: planetDrift 60s ease-in-out infinite; }
      `}</style>

      <div
        className="relative w-full rounded-xl overflow-hidden"
        style={{ height: "320px" }}
      >
        {/* ── Layer 1: Planet backdrop — slow drift simulates rotation ── */}
        <div
          className="planet-drift absolute inset-0"
          style={{
            backgroundImage: `url(${getBackgroundImage(location)})`,
            backgroundSize: "110% 110%",
            backgroundPosition: "50% 50%",
            backgroundRepeat: "no-repeat",
          }}
          role="img"
          aria-label="Planetary viewport"
        />

        {/* ── Layer 2: Planet disc mask — circular crop so the planet floats in space ── */}
        {/* Outer deep-space void: everything outside the disc goes nearly black */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 72% 60% at 50% 38%, transparent 0%, transparent 42%, rgba(0,0,6,0.6) 62%, rgba(0,0,6,0.92) 80%, rgba(0,0,6,0.98) 100%)",
          }}
        />
        {/* Atmosphere rim glow around the planet disc */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 58% at 50% 38%, transparent 36%, rgba(88,160,200,0.18) 48%, rgba(88,160,200,0.08) 56%, transparent 65%)",
          }}
        />

        {/* ── Layer 2b: Deep-space star field — fills the void outside the planet disc ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px), " +
              "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px), " +
              "radial-gradient(circle, rgba(136,192,208,0.25) 1px, transparent 1px)",
            backgroundSize: "34px 34px, 62px 62px, 97px 97px",
            backgroundPosition: "3px 7px, 18px 22px, 45px 11px",
            mixBlendMode: "screen",
            opacity: 0.7,
          }}
        />

        {/* ── Layer 3: Blueprint grid ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(136,192,208,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,192,208,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ── Layer 4: Scan line ── */}
        <div
          className="hud-scan-line absolute left-0 right-0 h-px pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(136,192,208,0.5) 30%, rgba(136,192,208,0.5) 70%, transparent 100%)",
          }}
        />

        {/* ── Layer 5: Atmosphere gradient at bottom ── */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "60%",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
          }}
        />

        {/* ── Layer 6: 3D Orbit rings — perspective container ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: 0,
            perspective: "400px",
            perspectiveOrigin: "50% 35%",
          }}
        >
          {/* Decorative outer ring */}
          <OrbitRing
            size={260}
            tiltX={74}
            tiltZ={20}
            period={30}
            color="rgba(136,192,208,0.08)"
            reverse
          />
          {/* Satellite orbit ring — shows when satellite available */}
          {deploymentStatus.satellites.available && (
            <OrbitRing
              size={210}
              tiltX={72}
              tiltZ={0}
              period={9}
              color={
                deploymentStatus.satellites.deployed
                  ? deploymentStatus.satellites.unclassifiedCount > 0
                    ? "rgba(251,191,36,0.35)"
                    : "rgba(56,189,248,0.3)"
                  : "rgba(255,255,255,0.07)"
              }
              showDot={deploymentStatus.satellites.deployed}
              dotColor={
                deploymentStatus.satellites.unclassifiedCount > 0
                  ? "#fbbf24"
                  : "#38bdf8"
              }
              dotGlow={
                deploymentStatus.satellites.unclassifiedCount > 0
                  ? "0 0 8px #fbbf24, 0 0 16px rgba(251,191,36,0.5)"
                  : "0 0 8px #38bdf8, 0 0 16px rgba(56,189,248,0.4)"
              }
            />
          )}
          {/* Inner decorative ring */}
          <OrbitRing
            size={168}
            tiltX={70}
            tiltZ={-30}
            period={18}
            color="rgba(136,192,208,0.06)"
          />
        </div>

        {/* ── HUD corners ── */}
        <HudCorner pos="tl" />
        <HudCorner pos="tr" />
        <HudCorner pos="bl" />
        <HudCorner pos="br" />

        {/* ── Top HUD row ── */}
        <div className="absolute top-3 left-0 right-0 px-4 flex items-start justify-between z-20">
          {/* Left: sector + coordinates */}
          <div>
            <div
              className="font-mono text-[8px] uppercase tracking-[0.28em] leading-none"
              style={{ color: "rgba(136,192,208,0.7)" }}
            >
              Home Sector
            </div>
            <div className="mt-1 space-y-0.5">
              <TelemetryLine label="RA" value={`${ra.toFixed(1)}°`} />
              <TelemetryLine label="DEC" value={`${dec >= 0 ? "+" : ""}${dec.toFixed(1)}°`} />
            </div>
          </div>

          {/* Right: stardust + upgrades */}
          <div className="flex flex-col items-end gap-1.5">
            <StardustBalance onPointsUpdate={() => {}} />

            {classificationsCount > 2 && availableUpgrades > 0 && (
              <Link
                href="/research"
                className="flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-white/10"
                style={{
                  border: "1px solid rgba(251,191,36,0.35)",
                  background: "rgba(251,191,36,0.08)",
                }}
              >
                <div className="relative">
                  <Wrench className="h-3 w-3 text-amber-300" strokeWidth={1.5} />
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white leading-none"
                    style={{ background: "#ef4444" }}
                  >
                    {availableUpgrades}
                  </span>
                </div>
                <span
                  className="font-mono text-[8px] uppercase tracking-widest hidden sm:inline"
                  style={{ color: "rgba(251,191,36,0.8)" }}
                >
                  {bothUpgradesUnlocked ? "Labs" : "Research"}
                </span>
              </Link>
            )}

            {/* Mission clock */}
            <div
              className="font-mono text-[7px] tabular-nums"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              MET {missionElapsed}
            </div>
          </div>
        </div>

        {/* ── Horizon divider ── */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{ bottom: "58px" }}
        >
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 80%, transparent 100%)",
            }}
          />
        </div>

        {/* ── Center: Surface beacons — structures deployed on planet ── */}
        <div
          className="absolute left-0 right-0 flex items-end justify-center gap-10 sm:gap-16 z-20"
          style={{ bottom: "64px" }}
        >
          <SurfaceBeacon
            deployed={deploymentStatus.telescope.deployed}
            hasSignals={deploymentStatus.telescope.unclassifiedCount > 0}
            signalCount={deploymentStatus.telescope.unclassifiedCount}
            label="Telescope"
            icon={
              <TelescopeIcon
                deployed={deploymentStatus.telescope.deployed}
                hasDiscoveries={deploymentStatus.telescope.unclassifiedCount > 0}
              />
            }
            href="/structures/telescope"
            accentColor="teal"
            glowColor="rgba(136,192,208,X)"
          />

          {deploymentStatus.satellites.available && (
            <SurfaceBeacon
              deployed={deploymentStatus.satellites.deployed}
              hasSignals={deploymentStatus.satellites.unclassifiedCount > 0}
              signalCount={deploymentStatus.satellites.unclassifiedCount}
              label="Satellite"
              icon={
                <SatelliteIcon
                  deployed={deploymentStatus.satellites.deployed}
                  hasDiscoveries={deploymentStatus.satellites.unclassifiedCount > 0}
                />
              }
              onClick={() => setShowPlanetSelector(true)}
              accentColor="sky"
              glowColor="rgba(56,189,248,X)"
            />
          )}

          <SurfaceBeacon
            deployed={deploymentStatus.rover.deployed}
            hasSignals={deploymentStatus.rover.unclassifiedCount > 0}
            signalCount={deploymentStatus.rover.unclassifiedCount}
            label="Rover"
            icon={
              <RoverIcon
                deployed={deploymentStatus.rover.deployed}
                hasDiscoveries={deploymentStatus.rover.unclassifiedCount > 0}
              />
            }
            href="/viewports/rover"
            accentColor="amber"
            glowColor="rgba(251,146,60,X)"
          />
        </div>

        {/* ── Bottom strip: avatar + signals summary ── */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AvatarGenerator author={session?.user.id || ""} />
            <div>
              <div className="text-xs font-bold leading-none" style={{ color: "rgba(255,255,255,0.85)" }}>
                {displayName}
              </div>
              <div
                className="font-mono text-[7px] uppercase tracking-[0.2em] mt-0.5"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Commander
              </div>
            </div>
          </div>

          {/* Total signals indicator */}
          {totalSignals > 0 && (
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-amber-400 animate-pulse" aria-hidden />
              <span className="font-mono text-[9px] text-amber-400">
                {totalSignals} pending
              </span>
            </div>
          )}

          {/* Deployment success toast */}
          {deploymentMessage && (
            <div
              className={cn(
                "font-mono text-[9px] px-2 py-1 rounded border",
                "text-teal-200",
                isAnimating && "animate-fade-up",
              )}
              style={{
                background: "rgba(0,0,0,0.6)",
                borderColor: "rgba(136,192,208,0.3)",
              }}
            >
              {deploymentMessage}
            </div>
          )}
        </div>
      </div>

      <PlanetSelectorModal
        open={showPlanetSelector}
        onOpenChange={setShowPlanetSelector}
        planetTargets={planetTargets}
        onSelectPlanet={handleSendSatellite}
      />
    </>
  );
}
