"use client";

import dynamic from "next/dynamic";
import styles from "../garden.module.css";
import { hopById, type MinigameDef, type StructureId } from "../catalog";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Real, full-production classify components — same ones mounted at
// /structures/telescope/planet-hunters, /structures/balloon/clouds, and
// /structures/telescope/sunspots today. They take no props (self-contained
// session/PocketBase fetching), so they mount here unchanged.
const PlanetHuntersSteps = dynamic(
  () => import("@/src/components/deployment/missions/structures/Astronomers/PlanetHunters/PlanetHunters"),
  { ssr: false, loading: () => <p className={styles.prompt}>Loading Planet Hunters…</p> }
);
const CloudspottingOnMars = dynamic(
  () => import("@/src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CloudspottingOnMars"),
  { ssr: false, loading: () => <p className={styles.prompt}>Loading Cloudspotting…</p> }
);
const SunspotSteps = dynamic(
  () => import("@/src/components/projects/Telescopes/Sunspots/SunspotShell"),
  { ssr: false, loading: () => <p className={styles.prompt}>Loading Sunspots…</p> }
);

export interface SkyClassifyProps {
  openMinigame: MinigameDef | null;
  onCloseMinigame: () => void;
  onCompleteSkyClassify: (structureId: StructureId) => void;
  probeGrainOpen: boolean;
  onCloseProbeGrain: () => void;
  onSendFlight: (id: StructureId, minigame: MinigameDef) => boolean;
  onHopOut: (hopId: string) => void;
}

/** ssc.flow.sky_classify — translucent overlay over the sky band; the camp stays visible underneath. */
export function SkyClassify({
  openMinigame,
  onCloseMinigame,
  onCompleteSkyClassify,
  probeGrainOpen,
  onCloseProbeGrain,
  onSendFlight,
  onHopOut,
}: SkyClassifyProps) {
  const isOpen = !!openMinigame || probeGrainOpen;
  if (!isOpen) return null;

  const title = probeGrainOpen ? "Probe flight" : openMinigame!.name;
  const id = probeGrainOpen ? "ssc.minigame.probe_return" : openMinigame!.id;
  const close = probeGrainOpen ? onCloseProbeGrain : onCloseMinigame;

  return (
    <div className={cx(styles.minigame, styles.isOpen)} role="dialog" aria-modal="true">
      <header>
        <h2>{title}</h2>
        <span className={styles.gid}>{id}</span>
        <button className={styles.mgClose} type="button" onClick={close}>
          Close
        </button>
      </header>
      <div className={styles.mgPlay}>
        {probeGrainOpen ? (
          <ProbeGrainPick onDone={onCloseProbeGrain} />
        ) : openMinigame!.id === "ssc.minigame.planet_hunters" ? (
          <RealClassify structureId={openMinigame!.structure} onDone={onCompleteSkyClassify}>
            <PlanetHuntersSteps />
          </RealClassify>
        ) : openMinigame!.id === "ssc.minigame.clouds" ? (
          <RealClassify structureId={openMinigame!.structure} onDone={onCompleteSkyClassify}>
            <CloudspottingOnMars />
          </RealClassify>
        ) : openMinigame!.id === "ssc.minigame.solar" ? (
          <RealClassify structureId={openMinigame!.structure} onDone={onCompleteSkyClassify}>
            <SunspotSteps />
          </RealClassify>
        ) : openMinigame!.id === "ssc.minigame.supply" ? (
          <SupplyPrompt mgDef={openMinigame!} onSendFlight={onSendFlight} onHopOut={onHopOut} onStay={onCloseMinigame} />
        ) : openMinigame!.id === "ssc.minigame.probe_return" ? (
          <ProbePrompt mgDef={openMinigame!} onSendFlight={onSendFlight} onStay={onCloseMinigame} />
        ) : null}
      </div>
    </div>
  );
}

function RealClassify({
  structureId,
  onDone,
  children,
}: {
  structureId: StructureId;
  onDone: (structureId: StructureId) => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="ssc-real-mount">{children}</div>
      <button
        className={styles.dipBtn}
        type="button"
        onClick={() => onDone(structureId)}
      >
        Back to the garden
      </button>
    </>
  );
}

function SupplyPrompt({
  mgDef,
  onSendFlight,
  onHopOut,
  onStay,
}: {
  mgDef: MinigameDef;
  onSendFlight: (id: StructureId, minigame: MinigameDef) => boolean;
  onHopOut: (hopId: string) => void;
  onStay: () => void;
}) {
  const hop = mgDef.hop ? hopById(mgDef.hop) : null;
  return (
    <>
      <p className={styles.prompt}>
        A crate on the pad. Spend {mgDef.cost} CR to send; greet it when the lander sits again. Deep
        flights live in Landnam.
      </p>
      <button
        className={styles.dipBtn}
        type="button"
        onClick={() => {
          if (onSendFlight(mgDef.structure, mgDef)) onStay();
        }}
      >
        Send supply · {mgDef.cost} CR
      </button>
      {hop && (
        <button className={cx(styles.btn, styles.btnHop)} type="button" onClick={() => onHopOut(hop.id)}>
          {hop.label} →
        </button>
      )}
      <button className={cx(styles.btn, styles.btnGhost)} type="button" onClick={onStay}>
        Stay
      </button>
    </>
  );
}

function ProbePrompt({
  mgDef,
  onSendFlight,
  onStay,
}: {
  mgDef: MinigameDef;
  onSendFlight: (id: StructureId, minigame: MinigameDef) => boolean;
  onStay: () => void;
}) {
  return (
    <>
      <p className={styles.prompt}>
        The probe sits on its legs. Send it; wait; collect when the sky gives it back.
      </p>
      <button
        className={styles.dipBtn}
        type="button"
        onClick={() => {
          if (onSendFlight(mgDef.structure, mgDef)) onStay();
        }}
      >
        Send probe
      </button>
      <button className={cx(styles.btn, styles.btnGhost)} type="button" onClick={onStay}>
        Stay
      </button>
    </>
  );
}

const GRAIN_CHOICES = [
  { ok: false, label: "Jagged basalt" },
  { ok: true, label: "Round grain" },
  { ok: false, label: "Flat shard" },
];

function ProbeGrainPick({ onDone }: { onDone: () => void }) {
  return (
    <>
      <p className={styles.prompt}>Samples on the dirt. Which pile is the round grain?</p>
      <div className={styles.choices}>
        {GRAIN_CHOICES.map((c) => (
          <button key={c.label} className={styles.choice} type="button" onClick={onDone}>
            {c.label}
          </button>
        ))}
      </div>
      <button className={cx(styles.btn, styles.btnGhost)} type="button" onClick={onDone}>
        Leave the pile
      </button>
    </>
  );
}

