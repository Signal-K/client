"use client";

import { useEffect, useState } from "react";
import styles from "../garden.module.css";
import { CATALOG, growthFor, hopById, structureById } from "../catalog";
import type { StructureId, MinigameDef } from "../catalog";
import type { GardenState } from "../useGardenState";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export interface GardenPanelProps {
  state: GardenState;
  openPanelId: StructureId | null;
  onClose: () => void;
  onTendHydro: () => void;
  onSitHabitat: () => void;
  onUpgrade: (id: StructureId) => void;
  onBeginPlace: (id: StructureId) => void;
  onCollectFlight: (id: StructureId) => void;
  onStartMinigame: (mg: MinigameDef) => void;
  onHopOut: (hopId: string) => void;
  onDeferredToast: () => void;
}

/** ssc.flow.panel — portrait bottom sheet / landscape right drawer (CSS-driven by [data-layout] on .stage). */
export function GardenPanel({
  state,
  openPanelId,
  onClose,
  onTendHydro,
  onSitHabitat,
  onUpgrade,
  onBeginPlace,
  onCollectFlight,
  onStartMinigame,
  onHopOut,
  onDeferredToast,
}: GardenPanelProps) {
  const [, forceTick] = useState(0);
  const def = openPanelId ? structureById(openPanelId) : null;
  const rec = openPanelId ? state.structures[openPanelId] : null;
  const flight = openPanelId ? state.flights[openPanelId] : undefined;

  // Re-render once a second while a flight is away so the "En route · Ns" countdown updates.
  useEffect(() => {
    if (flight?.status !== "away") return;
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [flight?.status]);

  const isOpen = !!(def && rec);

  return (
    <>
      <button
        type="button"
        className={styles.sheetScrim}
        hidden={!isOpen}
        aria-label="Close"
        onClick={onClose}
      />
      <section className={cx(styles.sheet, isOpen && styles.isOpen)} aria-live="polite">
        {def && rec ? (
          <PanelBody
            def={def}
            rec={rec}
            flight={flight}
            onClose={onClose}
            onTendHydro={onTendHydro}
            onSitHabitat={onSitHabitat}
            onUpgrade={onUpgrade}
            onBeginPlace={onBeginPlace}
            onCollectFlight={onCollectFlight}
            onStartMinigame={onStartMinigame}
            onHopOut={onHopOut}
            onDeferredToast={onDeferredToast}
            credits={state.credits}
          />
        ) : null}
      </section>
    </>
  );
}

function PanelBody({
  def,
  rec,
  flight,
  onClose,
  onTendHydro,
  onSitHabitat,
  onUpgrade,
  onBeginPlace,
  onCollectFlight,
  onStartMinigame,
  onHopOut,
  onDeferredToast,
  credits,
}: {
  def: NonNullable<ReturnType<typeof structureById>>;
  rec: NonNullable<GardenState["structures"][StructureId]>;
  flight: GardenState["flights"][StructureId];
  onClose: () => void;
  onTendHydro: () => void;
  onSitHabitat: () => void;
  onUpgrade: (id: StructureId) => void;
  onBeginPlace: (id: StructureId) => void;
  onCollectFlight: (id: StructureId) => void;
  onStartMinigame: (mg: MinigameDef) => void;
  onHopOut: (hopId: string) => void;
  onDeferredToast: () => void;
  credits: number;
}) {
  const stage = growthFor(def, rec.tier);
  const capacityLabel = stage?.capacity?.label ? `T${rec.tier} · ${stage.capacity.label}` : "";
  const next = rec.tier + 1;
  const nextCost = CATALOG.upgrade.costs[next - 1];
  const canUpgrade = !rec.locked && next <= CATALOG.upgrade.maxTier;
  const hop = def.hop ? hopById(def.hop) : null;
  const buildCost = def.buildCost ?? 0;
  const canBuild = rec.locked && rec.buildable && buildCost > 0;

  return (
    <>
      <h2>{def.name}{rec.locked ? "" : `  T${rec.tier}`}</h2>
      <p className={styles.meta}>{def.blurb}</p>
      <p className={styles.capacity}>
        {rec.locked
          ? rec.buildable
            ? `Plot ready · ${buildCost} CR to raise`
            : def.locked
              ? "Later session"
              : "Pick this project in your roster to unlock the plot"
          : capacityLabel}
      </p>
      <div className={styles.actions}>
        {canBuild ? (
          <button
            className={cx(styles.btn, styles.btnPrimary)}
            disabled={credits < buildCost}
            onClick={() => onBeginPlace(def.id)}
          >
            Place {def.name} · {buildCost} CR
          </button>
        ) : rec.locked ? (
          <button className={styles.btn} disabled onClick={onDeferredToast}>
            Choose this project first
          </button>
        ) : def.id === "ssc.structure.hydro" ? (
          <button className={cx(styles.btn, styles.btnPrimary)} onClick={onTendHydro}>
            Water the beds
          </button>
        ) : def.id === "ssc.structure.habitat" ? (
          <button className={cx(styles.btn, styles.btnPrimary)} onClick={onSitHabitat}>
            Sit with the greenhouse
          </button>
        ) : flight?.status === "away" ? (
          <button className={styles.btn} disabled>
            En route · {Math.max(0, Math.ceil((flight.eta - Date.now()) / 1000))}s
          </button>
        ) : flight?.status === "home" ? (
          <button className={cx(styles.btn, styles.btnPrimary)} onClick={() => onCollectFlight(def.id)}>
            Collect the return
          </button>
        ) : def.minigame ? (
          <MinigameAction def={def} onStartMinigame={onStartMinigame} />
        ) : null}

        {canUpgrade && (
          <button
            className={styles.btn}
            disabled={credits < nextCost}
            onClick={() => onUpgrade(def.id)}
          >
            Upgrade to T{next} · {nextCost} CR
          </button>
        )}

        {hop && !rec.locked && hop.href && (
          <button className={cx(styles.btn, styles.btnHop)} onClick={() => onHopOut(hop.id)}>
            {hop.label} →
          </button>
        )}

        <button className={cx(styles.btn, styles.btnGhost)} onClick={onClose}>
          Back to the garden
        </button>
      </div>
    </>
  );
}

function MinigameAction({
  def,
  onStartMinigame,
}: {
  def: NonNullable<ReturnType<typeof structureById>>;
  onStartMinigame: (mg: MinigameDef) => void;
}) {
  const mgDef = CATALOG.minigames[def.minigame!];
  return (
    <button className={cx(styles.btn, styles.btnPrimary)} onClick={() => onStartMinigame(mgDef)}>
      {def.verb} — {mgDef.name}
    </button>
  );
}
