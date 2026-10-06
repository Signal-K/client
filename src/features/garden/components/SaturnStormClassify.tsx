"use client";

import { useState } from "react";

import styles from "../garden.module.css";
import { useSaturnFrames } from "../useSaturnFrames";
import {
  SATURN_QUESTION,
  SATURN_VERDICTS,
  pickNextSaturnFrame,
  submitSaturnClassification,
  type SaturnVerdict,
} from "@/src/lib/gameplay/saturnStorm";

/** Saturn Thunderstorm Search frames from the shared pool (SSC-43). */
export function SaturnStormClassify() {
  const { frames, loading } = useSaturnFrames(true);
  const [answered, setAnswered] = useState<ReadonlySet<string>>(new Set());
  const [note, setNote] = useState("");

  if (loading) return <p className={styles.prompt}>Loading Saturn frames…</p>;
  const frame = pickNextSaturnFrame(frames, answered);
  if (!frame) {
    return (
      <p className={styles.prompt}>
        {frames.length === 0
          ? "No Saturn frames are available right now. Try again later."
          : "You have answered every frame loaded for now. Check back soon."}
      </p>
    );
  }

  const answer = async (verdict: SaturnVerdict) => {
    setAnswered((prev) => new Set(prev).add(frame.id));
    const ok = await submitSaturnClassification(frame.id, verdict);
    setNote(ok ? "" : "Could not reach the shared classification feed.");
  };

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frame.imageUrl} alt={`Cassini frame ${frame.opusId || frame.subjectId}`} style={{ maxWidth: "100%", borderRadius: 6 }} />
      <p className={styles.prompt}>{SATURN_QUESTION}</p>
      <div className={styles.choices}>
        {SATURN_VERDICTS.map((v) => (
          <button key={v.verdict} className={styles.choice} type="button" onClick={() => void answer(v.verdict)}>
            {v.label}
          </button>
        ))}
      </div>
      {note && <p className={styles.prompt}>{note}</p>}
    </>
  );
}
