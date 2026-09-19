"use client";

import { useState } from "react";
import styles from "../garden.module.css";
import { structureById, type StructureId } from "../catalog";
import type { ProjectType } from "@/src/features/onboarding/hubState";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const CHOICES: Array<{ project: ProjectType; structure: StructureId; title: string; blurb: string }> = [
  {
    project: "planet-hunting",
    structure: "ssc.structure.telescope",
    title: "Hunt planets",
    blurb: "Raise a telescope and classify planet candidates.",
  },
  {
    project: "cloud-tracking",
    structure: "ssc.structure.satellite",
    title: "Track clouds",
    blurb: "Raise a satellite and spot clouds on Mars.",
  },
  {
    project: "solar-monitoring",
    structure: "ssc.structure.solar",
    title: "Watch the sun",
    blurb: "Raise a solar array and mark sunspots.",
  },
];

export interface GardenOnboardingProps {
  isOpen: boolean;
  credits: number;
  onSave: (projects: ProjectType[]) => void;
  /** Set when reopened after first run, so the player can back out. */
  onClose?: () => void;
}

/** First-run flow for a fresh garden: pick what to raise → tap a plot → choose a spot → build. */
export function GardenOnboarding({ isOpen, credits, onSave, onClose }: GardenOnboardingProps) {
  const [picked, setPicked] = useState<ProjectType[]>([]);
  if (!isOpen) return null;

  const toggle = (project: ProjectType) =>
    setPicked((prev) => (prev.includes(project) ? prev.filter((p) => p !== project) : [...prev, project]));

  return (
    <div className={styles.onbScrim} role="dialog" aria-modal="true" aria-labelledby="onb-title">
      <div className={styles.onbCard}>
        <h2 id="onb-title">Your garden starts fresh</h2>
        <p className={styles.onbLead}>
          Everything you contributed, your research, and your {credits} CR came with you. What you had before is
          archived. Now you decide what grows here.
        </p>
        <p className={styles.onbStep}>1 · Choose what to raise first</p>
        <div className={styles.onbChoices}>
          {CHOICES.map((choice) => {
            const cost = structureById(choice.structure)?.buildCost ?? 0;
            const on = picked.includes(choice.project);
            return (
              <button
                key={choice.project}
                type="button"
                aria-pressed={on}
                className={cx(styles.onbChoice, on && styles.onbChoiceOn)}
                onClick={() => toggle(choice.project)}
              >
                <strong>{choice.title}</strong>
                <span>{choice.blurb}</span>
                <em>{cost} CR</em>
              </button>
            );
          })}
        </div>
        <p className={styles.onbHint}>Next you&apos;ll tap a plot and pick where it goes.</p>
        <button
          type="button"
          className={cx(styles.btn, styles.btnPrimary)}
          disabled={picked.length === 0}
          onClick={() => onSave(picked)}
        >
          Mark my plots
        </button>
        {onClose && (
          <button type="button" className={cx(styles.btn, styles.btnGhost)} onClick={onClose}>
            Not now
          </button>
        )}
      </div>
    </div>
  );
}

/** Shown after the roster until the first instrument is raised. */
export function GardenCoach({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className={styles.coach} role="status">
      {message}
    </div>
  );
}
