"use client";

import { Sparkles, User } from "lucide-react";
import styles from "../garden.module.css";
import { CATALOG } from "../catalog";
import type { SkyPhase } from "../useSkyPhase";

export interface GardenHudProps {
  credits: number;
  phase: SkyPhase;
  onProfileClick?: () => void;
  onProjectsClick?: () => void;
}

/** ssc.currency.credits + sky-phase chip. Replaces CommandHeader for the garden hub. */
export function GardenHud({ credits, phase, onProfileClick, onProjectsClick }: GardenHudProps) {
  return (
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
            aria-label="Profile"
          >
            <User size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
