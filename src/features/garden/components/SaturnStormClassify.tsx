"use client";

import { useRef, useState } from "react";

import styles from "../garden.module.css";
import { useSaturnFrames } from "../useSaturnFrames";
import { COMET_CATCHERS } from "../skyEvents";
import {
  SATURN_QUESTION,
  SATURN_SESSION_SIZE,
  SATURN_VERDICTS,
  pickNextSaturnFrame,
  submitSaturnClassification,
  type SaturnVerdict,
} from "@/src/lib/gameplay/saturnStorm";

/** Saturn Storm Watch: a 10-frame session from the shared pool (SSC-42, SSC-43). */
export function SaturnStormClassify({ onSessionComplete }: { onSessionComplete?: () => void }) {
  const { frames, loading } = useSaturnFrames(true);
  const [answered, setAnswered] = useState<ReadonlySet<string>>(new Set());
  const [saved, setSaved] = useState(0);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const completed = useRef(false);

  if (loading) return <p className={styles.prompt}>Loading Saturn frames…</p>;

  if (done) {
    return (
      <>
        <p className={styles.prompt}>
          Session saved: {SATURN_SESSION_SIZE} frames added to the shared pool. Thank you.
        </p>
        <CometCard />
        <button
          className={styles.dipBtn}
          type="button"
          onClick={() => {
            completed.current = false;
            setSaved(0);
            setDone(false);
          }}
        >
          Start another session
        </button>
      </>
    );
  }

  const frame = pickNextSaturnFrame(frames, answered);
  if (!frame) {
    return (
      <>
        <p className={styles.prompt}>
          {frames.length === 0
            ? "No Saturn frames are available right now. Try again later."
            : "You have answered every frame loaded for now. Check back soon."}
        </p>
        <CometCard />
      </>
    );
  }

  const answer = async (verdict: SaturnVerdict) => {
    if (busy) return;
    setBusy(true);
    const ok = await submitSaturnClassification(frame.id, verdict);
    setBusy(false);
    if (!ok) {
      setNote("Could not reach the shared classification feed. Try that frame again.");
      return;
    }
    setNote("");
    setAnswered((prev) => new Set(prev).add(frame.id));
    const next = saved + 1;
    setSaved(next);
    if (next >= SATURN_SESSION_SIZE && !completed.current) {
      completed.current = true;
      setDone(true);
      onSessionComplete?.();
    }
  };

  return (
    <>
      <p className={styles.prompt}>
        Saturn Storm Watch · frame {saved + 1} of {SATURN_SESSION_SIZE}
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={frame.imageUrl} alt={`Cassini frame ${frame.opusId || frame.subjectId}`} style={{ maxWidth: "100%", borderRadius: 6 }} />
      <p className={styles.prompt}>{SATURN_QUESTION}</p>
      <div className={styles.choices}>
        {SATURN_VERDICTS.map((v) => (
          <button key={v.verdict} className={styles.choice} type="button" disabled={busy} onClick={() => void answer(v.verdict)}>
            {v.label}
          </button>
        ))}
      </div>
      {note && <p className={styles.prompt}>{note}</p>}
    </>
  );
}

/** Live Zooniverse link-out, framed around Phoebe (SSC-42). No in-house classifier. */
function CometCard() {
  return (
    <p className={styles.prompt}>
      <strong>{COMET_CATCHERS.title}.</strong> {COMET_CATCHERS.body}{" "}
      <a href={COMET_CATCHERS.href} target="_blank" rel="noopener noreferrer">
        Open on Zooniverse →
      </a>
    </p>
  );
}
