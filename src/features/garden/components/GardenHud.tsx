"use client";

import { Sparkles, User } from "lucide-react";
import styles from "../garden.module.css";
import { CATALOG, hopRail } from "../catalog";
import type { SkyPhase } from "../useSkyPhase";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface GardenHudProps {
  credits: number;
  phase: SkyPhase;
  username?: string | null;
  watered?: boolean;
  idleRate?: number;
  onProfileClick?: () => void;
  onProjectsClick?: () => void;
  onHopOut?: (hopId: string) => void;
}

/** ssc.currency.credits + identity chip + suite hop rail. */
export function GardenHud({
  credits,
  phase,
  username,
  watered,
  idleRate,
  onProfileClick,
  onProjectsClick,
  onHopOut,
}: GardenHudProps) {
  return (
    <>
      <header className={styles.hud}>
        <div className={styles.chip} title={CATALOG.currency.id}>
          <span className={styles.coin} aria-hidden="true" />
          <span>{credits}</span>
          <span style={{ fontWeight: 550, opacity: 0.7, fontSize: 11 }}>{CATALOG.currency.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <div className={styles.phaseChip}>{phase}</div>
          {onProjectsClick && (
            <button
              type="button"
              className={styles.chip}
              style={{ padding: "6px 10px" }}
              onClick={onProjectsClick}
              aria-label="Project roster"
              title="Choose science tracks"
            >
              <Sparkles size={16} />
            </button>
          )}
          {onProfileClick && (
            <button
              type="button"
              className={styles.chip}
              style={{ padding: "6px 10px" }}
              onClick={onProfileClick}
              aria-label={username ? `Profile, ${username}` : "Profile"}
            >
              <User size={16} />
              {username ? <span style={{ fontSize: 12, fontWeight: 650 }}>{username}</span> : null}
            </button>
          )}
        </div>
      </header>
      <nav className={styles.hopRail} aria-label="Suite hops">
        {hopRail().map((hop) => {
          const here = hop.id === "ssc.hop.garden";
          return (
            <button
              key={hop.id}
              type="button"
              className={cx(styles.hopBtn, here && styles.isHere)}
              disabled={here}
              title={hop.blurb}
              onClick={() => !here && onHopOut?.(hop.id)}
            >
              {hop.label}
            </button>
          );
        })}
      </nav>
      {watered && idleRate != null ? (
        <p className={styles.idleChip}>Beds watered · +{idleRate} CR / 14s</p>
      ) : null}
    </>
  );
}
