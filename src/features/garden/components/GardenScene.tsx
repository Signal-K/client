"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../garden.module.css";
import type { StructureId } from "../catalog";
import type { GardenState } from "../useGardenState";
import type { SkyPhase } from "../useSkyPhase";

const SHOOTING_STAR_MS = 3200;
const AMBIENT_LAUNCH_MS = 12000;

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useShootingStars(phase: SkyPhase) {
  const [stars, setStars] = useState<{ id: number; top: string; left: string }[]>([]);
  const nextId = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      if (phase !== "night" && phase !== "dusk") return;
      const star = {
        id: nextId.current++,
        top: `${6 + Math.random() * 32}%`,
        left: `${2 + Math.random() * 72}%`,
      };
      setStars((prev) => [...prev, star]);
      setTimeout(() => setStars((prev) => prev.filter((s) => s.id !== star.id)), 1300);
    }, SHOOTING_STAR_MS);
    return () => clearInterval(id);
  }, [phase]);
  return stars;
}

type PulseAnim = "idle" | "flying" | "landing";

function useFlightPulse(isAway: boolean | undefined, flyMs: number, landMs: number) {
  const [anim, setAnim] = useState<PulseAnim>("idle");
  const [pulseKey, setPulseKey] = useState(0);
  const prevAway = useRef<boolean | undefined>(undefined);

  const pulse = (next: "flying" | "landing", duration: number) => {
    setAnim(next);
    setPulseKey((k) => k + 1);
    setTimeout(() => setAnim("idle"), duration);
  };

  useEffect(() => {
    if (prevAway.current === undefined) {
      prevAway.current = isAway;
      return;
    }
    if (isAway && !prevAway.current) pulse("flying", flyMs);
    if (!isAway && prevAway.current) pulse("landing", landMs);
    prevAway.current = isAway;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAway]);

  return { anim, pulseKey, pulse };
}

export interface GardenSceneProps {
  state: GardenState;
  onOpen: (id: StructureId) => void;
  layout: "portrait" | "landscape";
  phase: SkyPhase;
  children?: React.ReactNode;
}

export function GardenScene({ state, onOpen, layout, phase, children }: GardenSceneProps) {
  const shootingStars = useShootingStars(phase);

  const padFlight = state.flights["ssc.structure.pad"];
  const probeFlight = state.flights["ssc.structure.probe"];
  const padAway = padFlight?.status === "away";
  const probeAway = probeFlight?.status === "away";

  const pad = useFlightPulse(padAway, 4300, 2700);
  const probe = useFlightPulse(probeAway, 2500, 2500);

  // Ambient ship leaving the pad every ~12s, purely so the garden isn't still.
  // Does not fire while the pad itself is away on a real send.
  useEffect(() => {
    const initial = setTimeout(() => {
      if (!padAway) pad.pulse("flying", 4300);
    }, 1800);
    const id = setInterval(() => {
      if (!padAway) pad.pulse("flying", 4300);
    }, AMBIENT_LAUNCH_MS);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.stage} data-phase={phase} data-layout={layout}>
      <div className={styles.sky} data-phase={phase}>
        <div className={cx(styles.skyWash, styles.skyDawn, phase === "dawn" && styles.isOn)} />
        <div className={cx(styles.skyWash, styles.skyDay, phase === "day" && styles.isOn)} />
        <div className={cx(styles.skyWash, styles.skyDusk, phase === "dusk" && styles.isOn)} />
        <div className={cx(styles.skyWash, styles.skyNight, phase === "night" && styles.isOn)} />
        <div className={styles.skyGrain} aria-hidden="true" />
        <div className={styles.skyClouds} data-phase={phase} aria-hidden="true" />
        <div className={styles.horizonGlow} data-phase={phase} aria-hidden="true" />
        <div className={styles.farWorld} aria-hidden="true" />
        <div className={styles.stars} />
        <div className={styles.sun} aria-hidden="true" />
        <div className={styles.moon} aria-hidden="true" />
      </div>
      <div className={styles.hills} aria-hidden="true" />
      <div className={styles.ridge} aria-hidden="true" />
      <div className={styles.dustMotes} aria-hidden="true" />

      <div className={styles.skyLife} aria-hidden="true">
        {shootingStars.map((s) => (
          <span key={s.id} className={styles.shootingStar} style={{ top: s.top, left: s.left }} />
        ))}
      </div>

      <div
        key={`pad-launch-${pad.pulseKey}`}
        className={cx(styles.ambientLaunch, pad.anim === "flying" && styles.isFlying, pad.anim === "landing" && styles.isLanding)}
        aria-hidden="true"
      >
        <svg viewBox="0 0 36 44">
          <ellipse cx="18" cy="40" rx="10" ry="3" fill="rgba(80,60,40,0.2)" />
          <ellipse cx="18" cy="16" rx="10" ry="12" fill="#efe6d6" stroke="#c9bfb0" />
          <rect x="10" y="20" width="4" height="12" rx="1" fill="#c9bfb0" />
          <rect x="22" y="20" width="4" height="12" rx="1" fill="#c9bfb0" />
          <circle cx="18" cy="12" r="4" fill="#d0e8e4" />
          <path className={styles.exhaust} d="M14 32 Q18 42 22 32" fill="#f0b45a" opacity="0.9" />
        </svg>
      </div>

      <div className={styles.world}>
        <div className={styles.plain} aria-hidden="true">
          <div className={styles.plainRocks} />
          <div className={styles.yard} />
          <div className={styles.path} />
        </div>
        <div className={styles.plot}>
          <GardenSubject id="ssc.structure.telescope" kind="transit" state={state} onOpen={onOpen}>
            <svg viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="21" fill="rgba(255,255,255,0.72)" />
              <polygon points="24,3 27,17 42,17 30,25 34,40 24,31 14,40 18,25 6,17 21,17" fill="#f7e08a" stroke="#c48a2a" strokeWidth="1.2" />
              <circle cx="14" cy="26" r="5.5" fill="#3a5a8c" />
            </svg>
          </GardenSubject>
          <GardenSubject id="ssc.structure.satellite" kind="cloud" state={state} onOpen={onOpen}>
            <svg viewBox="0 0 56 32">
              <ellipse cx="22" cy="18" rx="14" ry="9" fill="#f4f7fb" />
              <ellipse cx="34" cy="16" rx="12" ry="8" fill="#eef3f8" />
              <ellipse cx="28" cy="22" rx="16" ry="7" fill="#f7fafc" />
            </svg>
          </GardenSubject>
          <GardenSubject id="ssc.structure.solar" kind="sun" state={state} onOpen={onOpen}>
            <svg viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="14" fill="#f0c45a" />
              <circle cx="16" cy="18" r="2.2" fill="#8a5a20" />
              <circle cx="26" cy="26" r="1.8" fill="#8a5a20" />
            </svg>
          </GardenSubject>
          <GardenSubject id="ssc.structure.pad" kind="crate" state={state} onOpen={onOpen}>
            <svg viewBox="0 0 36 36">
              <rect x="8" y="12" width="20" height="14" rx="2" fill="#d9ccb8" stroke="#a89880" />
              <path d="M8 18 H28" stroke="#c4b49a" />
            </svg>
          </GardenSubject>
          <GardenSubject id="ssc.structure.probe" kind="speck" state={state} onOpen={onOpen}>
            <svg viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="7" fill="#efe6d6" stroke="#c9bfb0" />
              <circle cx="14" cy="14" r="2.5" fill="#4a4038" />
            </svg>
          </GardenSubject>

          <GardenThing id="ssc.structure.habitat" slug="habitat" state={state} onOpen={onOpen} label="Habitat">
            <svg viewBox="0 0 120 110">
              <ellipse cx="60" cy="96" rx="38" ry="8" fill="rgba(80,60,40,0.18)" />
              <path d="M24 70 L24 52 Q24 28 60 18 Q96 28 96 52 L96 70 Q96 82 60 86 Q24 82 24 70Z" fill="#efe6d6" stroke="#c9bfb0" strokeWidth="1.2" />
              <path d="M32 54 Q60 22 88 54 Q88 62 60 66 Q32 62 32 54Z" fill="#b7e4dc" stroke="#7aa8a0" strokeWidth="1" opacity="0.9" />
              <g className={styles.plantSway} fill="#6f9a5e">
                <ellipse cx="50" cy="48" rx="4" ry="6" />
                <ellipse cx="62" cy="44" rx="5" ry="7" />
                <ellipse cx="72" cy="50" rx="4" ry="5" />
              </g>
              <g className={cx(styles.growthT2, styles.plantSway)} fill="#5a8a4c">
                <ellipse cx="42" cy="52" rx="4" ry="6" />
                <ellipse cx="78" cy="50" rx="4" ry="6" />
              </g>
              <g className={styles.growthT3}>
                <path d="M18 72 Q18 58 32 54 L32 74 Q24 78 18 72Z" fill="#efe6d6" stroke="#c9bfb0" />
                <g className={styles.plantSway} fill="#6f9a5e">
                  <ellipse cx="26" cy="62" rx="4" ry="6" />
                  <ellipse cx="88" cy="58" rx="5" ry="7" />
                </g>
              </g>
              <rect x="52" y="68" width="16" height="14" rx="2" fill="#d9ccb8" />
              <rect className={styles.windowGlow} x="34" y="62" width="10" height="8" rx="1" fill="#e8c96a" opacity="0.35" />
              <rect className={styles.windowGlow} x="76" y="62" width="10" height="8" rx="1" fill="#e8c96a" opacity="0.35" />
            </svg>
          </GardenThing>

          <GardenThing id="ssc.structure.hydro" slug="hydro" state={state} onOpen={onOpen} label="Garden">
            <svg viewBox="0 0 110 70">
              <rect x="8" y="18" width="94" height="44" rx="3" fill="#c4b49a" stroke="#8d7354" strokeWidth="1.4" />
              <path d="M8 32 H102 M8 48 H102 M39 18 V62 M71 18 V62" stroke="#a58a66" strokeWidth="1.2" />
              <g fill="#3d6b45">
                <rect x="14" y="22" width="20" height="8" rx="1" />
                <rect x="45" y="22" width="20" height="8" rx="1" />
                <rect className={styles.growthT2} x="76" y="22" width="20" height="8" rx="1" />
                <rect x="14" y="38" width="20" height="8" rx="1" />
                <rect className={styles.growthT2} x="45" y="38" width="20" height="8" rx="1" />
                <rect className={styles.growthT3} x="76" y="38" width="20" height="8" rx="1" />
              </g>
              <g className={styles.plantSway} fill="#6f9a5e">
                <ellipse cx="24" cy="24" rx="5" ry="7" />
                <ellipse cx="55" cy="24" rx="5" ry="7" />
                <ellipse className={styles.growthT2} cx="86" cy="24" rx="5" ry="7" />
                <ellipse cx="24" cy="40" rx="5" ry="7" />
                <ellipse className={styles.growthT2} cx="55" cy="40" rx="5" ry="7" />
                <ellipse className={styles.growthT3} cx="86" cy="40" rx="5" ry="7" />
              </g>
            </svg>
          </GardenThing>

          <GardenThing id="ssc.structure.telescope" slug="telescope" state={state} onOpen={onOpen} label="Telescope">
            <svg viewBox="0 0 80 80">
              <ellipse cx="40" cy="72" rx="22" ry="6" fill="rgba(80,60,40,0.18)" />
              <path d="M18 58 Q18 28 40 22 Q62 28 62 58 Q62 68 40 70 Q18 68 18 58Z" fill="#efe6d6" stroke="#c9bfb0" />
              <path d="M28 36 Q40 24 52 36 Q52 48 40 50 Q28 48 28 36Z" fill="#4a4038" />
              <rect x="36" y="30" width="18" height="10" rx="4" transform="rotate(-18 40 36)" fill="#6a6058" />
              <circle cx="52" cy="28" r="5" fill="#2a2420" />
              <g className={styles.growthT2}>
                <rect x="44" y="22" width="20" height="8" rx="3" transform="rotate(-22 54 26)" fill="#4a4038" />
              </g>
              <g className={styles.growthT3}>
                <path d="M12 60 Q12 48 22 46 L22 64 Q16 66 12 60Z" fill="#efe6d6" stroke="#c9bfb0" />
                <circle cx="17" cy="54" r="3" fill="#2a2420" />
              </g>
            </svg>
          </GardenThing>

          <GardenThing id="ssc.structure.satellite" slug="satellite" state={state} onOpen={onOpen} label="Satellite">
            <svg viewBox="0 0 70 80">
              <ellipse cx="35" cy="72" rx="16" ry="5" fill="rgba(80,60,40,0.18)" />
              <rect x="28" y="54" width="14" height="16" rx="2" fill="#efe6d6" stroke="#c9bfb0" />
              <g className={styles.dishIdle}>
                <ellipse cx="36" cy="36" rx="18" ry="13" fill="#e8e4dc" stroke="#b0a89c" strokeWidth="1.4" />
                <ellipse className={styles.growthT2} cx="36" cy="36" rx="22" ry="16" fill="#e8e4dc" stroke="#b0a89c" strokeWidth="1.4" />
                <ellipse cx="36" cy="36" rx="10" ry="7" fill="#d0ccc4" />
                <line x1="36" y1="36" x2="36" y2="54" stroke="#8a8074" strokeWidth="2" />
              </g>
              <g className={cx(styles.growthT3, styles.dishIdle)}>
                <ellipse cx="18" cy="42" rx="10" ry="7" fill="#e8e4dc" stroke="#b0a89c" />
                <line x1="24" y1="46" x2="30" y2="54" stroke="#8a8074" strokeWidth="1.5" />
              </g>
            </svg>
          </GardenThing>

          <GardenThing id="ssc.structure.solar" slug="solar" state={state} onOpen={onOpen} label="Solar">
            <svg viewBox="0 0 80 60">
              <ellipse cx="40" cy="54" rx="24" ry="5" fill="rgba(80,60,40,0.18)" />
              <g className={styles.solarGlint}>
                <rect x="8" y="16" width="28" height="28" rx="2" fill="#3a5a8c" stroke="#d9ccb8" transform="skewY(-8)" />
                <rect className={styles.growthT2} x="40" y="16" width="28" height="28" rx="2" fill="#3a5a8c" stroke="#d9ccb8" transform="skewY(-8)" />
                <rect className={styles.growthT3} x="24" y="2" width="24" height="20" rx="2" fill="#3a5a8c" stroke="#d9ccb8" transform="skewY(-8)" />
                <path d="M10 24 H34 M10 32 H34" stroke="#9ec4e8" strokeWidth="0.8" opacity="0.5" />
                <path className={styles.growthT2} d="M46 24 H70 M46 32 H70" stroke="#9ec4e8" strokeWidth="0.8" opacity="0.5" />
              </g>
            </svg>
          </GardenThing>

          <GardenThing id="ssc.structure.pad" slug="pad" state={state} onOpen={onOpen} label="Pad">
            <svg viewBox="0 0 90 80">
              <ellipse cx="45" cy="70" rx="32" ry="8" fill="rgba(80,60,40,0.16)" />
              <rect x="12" y="48" width="66" height="24" rx="3" fill="#d9ccb8" stroke="#a89880" />
              <path d="M20 56 H70 M45 50 V70" stroke="#c4b49a" />
              <g className={styles.growthT2}>
                <circle cx="22" cy="60" r="3" fill="#efe6d6" />
                <circle cx="68" cy="60" r="3" fill="#efe6d6" />
                <path d="M18 52 H72" stroke="#8d7354" strokeWidth="1.2" />
              </g>
              <g className={styles.parkedHull}>
                <ellipse cx="45" cy="40" rx="16" ry="18" fill="#efe6d6" stroke="#c9bfb0" />
                <rect x="28" y="44" width="8" height="14" rx="1" fill="#c9bfb0" />
                <rect x="54" y="44" width="8" height="14" rx="1" fill="#c9bfb0" />
                <circle cx="45" cy="34" r="6" fill="#d0e8e4" />
                <g className={styles.growthT3}>
                  <rect x="38" y="20" width="14" height="10" rx="2" fill="#c9bfb0" />
                  <circle cx="45" cy="24" r="3" fill="#d0e8e4" />
                </g>
              </g>
            </svg>
          </GardenThing>

          <GardenThing id="ssc.structure.probe" slug="probe" state={state} onOpen={onOpen} label="Probe">
            <svg viewBox="0 0 50 70">
              <ellipse cx="25" cy="64" rx="12" ry="4" fill="rgba(80,60,40,0.18)" />
              <circle cx="25" cy="28" r="12" fill="#efe6d6" stroke="#c9bfb0" />
              <circle cx="25" cy="26" r="5" fill="#4a4038" />
              <line x1="25" y1="40" x2="12" y2="62" stroke="#8a8074" strokeWidth="2" />
              <line x1="25" y1="40" x2="38" y2="62" stroke="#8a8074" strokeWidth="2" />
              <line className={styles.growthT3} x1="25" y1="40" x2="25" y2="64" stroke="#8a8074" strokeWidth="2" />
              <line x1="25" y1="16" x2="25" y2="6" stroke="#8a8074" strokeWidth="2" />
              <circle cx="25" cy="5" r="2.5" fill="#c9bfb0" />
              <g className={styles.growthT2}>
                <ellipse cx="25" cy="8" rx="6" ry="3" fill="#e8e4dc" stroke="#b0a89c" />
              </g>
            </svg>
          </GardenThing>

          <button
            className={cx(styles.thing, styles.isLocked)}
            data-id="ssc.structure.rover"
            data-slug="rover"
            data-tier="0"
            type="button"
            aria-label="Rover, locked"
            onClick={() => onOpen("ssc.structure.rover")}
          >
            <svg viewBox="0 0 70 50">
              <ellipse cx="35" cy="44" rx="20" ry="5" fill="rgba(80,60,40,0.18)" />
              <rect x="18" y="18" width="34" height="14" rx="3" fill="#d4ccc0" stroke="#b0a89c" />
              <circle cx="22" cy="36" r="7" fill="#8a8074" />
              <circle cx="48" cy="36" r="7" fill="#8a8074" />
              <rect x="44" y="10" width="4" height="12" fill="#b0a89c" />
            </svg>
            <span className={styles.label}>Rover · later</span>
          </button>

          <div className={styles.crew} aria-hidden="true">
            <svg viewBox="0 0 28 44">
              <circle cx="14" cy="10" r="7" fill="#efe6d6" stroke="#c9bfb0" />
              <rect x="8" y="16" width="12" height="16" rx="4" fill="#efe6d6" stroke="#c9bfb0" />
              <rect x="10" y="32" width="3" height="10" fill="#d9ccb8" />
              <rect x="15" y="32" width="3" height="10" fill="#d9ccb8" />
            </svg>
          </div>
          <div className={styles.crewB} aria-hidden="true">
            <svg viewBox="0 0 28 44">
              <circle cx="14" cy="10" r="7" fill="#efe6d6" stroke="#c9bfb0" />
              <rect x="8" y="16" width="12" height="16" rx="4" fill="#efe6d6" stroke="#c9bfb0" />
              <rect x="10" y="32" width="3" height="10" fill="#d9ccb8" />
              <rect x="15" y="32" width="3" height="10" fill="#d9ccb8" />
            </svg>
          </div>
        </div>
      </div>

      <div
        key={`probe-ship-${probe.pulseKey}`}
        className={cx(styles.probeShip, probe.anim === "flying" && styles.isFlying, probe.anim === "landing" && styles.isLanding)}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill="#efe6d6" stroke="#c9bfb0" />
          <circle cx="12" cy="12" r="3" fill="#4a4038" />
        </svg>
      </div>

      {children}
    </div>
  );
}

function GardenThing({
  id,
  slug,
  state,
  onOpen,
  label,
  children,
}: {
  id: StructureId;
  slug: string;
  state: GardenState;
  onOpen: (id: StructureId) => void;
  label: string;
  children: React.ReactNode;
}) {
  const rec = state.structures[id];
  const flight = state.flights[id];
  const away = flight?.status === "away";
  const ready = !!rec?.ready && !rec?.locked && !away;

  return (
    <button
      className={cx(styles.thing, rec?.locked && styles.isLocked, away && styles.isAway, ready && styles.isReady)}
      data-id={id}
      data-slug={slug}
      data-tier={String(rec?.tier ?? 0)}
      type="button"
      aria-label={label}
      onClick={() => onOpen(id)}
    >
      {children}
      <span className={styles.label}>{label}</span>
    </button>
  );
}

function GardenSubject({
  id,
  kind,
  state,
  onOpen,
  children,
}: {
  id: StructureId;
  kind: string;
  state: GardenState;
  onOpen: (id: StructureId) => void;
  children: React.ReactNode;
}) {
  const rec = state.structures[id];
  const flight = state.flights[id];
  const away = flight?.status === "away";
  const show = !!rec && !rec.locked && (rec.ready || away);

  return (
    <button
      className={cx(styles.subject, !show && styles.isOff, away && styles.isAway)}
      data-for={id}
      data-kind={kind}
      type="button"
      aria-label={`Classify ${kind}`}
      onClick={() => onOpen(id)}
    >
      {children}
    </button>
  );
}
