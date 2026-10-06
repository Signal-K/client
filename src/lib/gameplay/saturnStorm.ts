// Saturn Thunderstorm Search frames from the shared science pool (SSC-43).
// Mirrors Landnam's web/lib/data/saturn-candidates.ts record shape so Garden
// and Landnam draw frames from, and write answers to, the same collections.

export type SaturnVerdict = "yes" | "no" | "maybe";

export const SATURN_QUESTION = "Is there a storm cloud in the image?";
export const SATURN_VERDICTS: ReadonlyArray<{ verdict: SaturnVerdict; label: string }> = [
  { verdict: "yes", label: "Yes" },
  { verdict: "no", label: "No" },
  { verdict: "maybe", label: "Maybe" },
];

export const SATURN_FRAMES_COLLECTION = "ss_saturn_storm_frames";
export const SATURN_CLASSIFICATIONS_COLLECTION = "ss_saturn_storm_classifications";

export interface SaturnFrame {
  id: string;
  subjectId: string;
  opusId: string;
  imageUrl: string;
}

export function isSaturnVerdict(value: unknown): value is SaturnVerdict {
  return value === "yes" || value === "no" || value === "maybe";
}

/** Same field mapping as Landnam's toSaturnCandidate. */
export function toSaturnFrame(record: Record<string, unknown>): SaturnFrame {
  const subjectId = String(record.subject_id ?? record.subjectId ?? record.id ?? "");
  return {
    id: String(record.id ?? `saturn-${subjectId}`),
    subjectId,
    opusId: String(record.opus_id ?? record.opusId ?? ""),
    imageUrl: String(record.image_url ?? record.imageUrl ?? ""),
  };
}

/** Keep only frames that can actually be rendered and classified. */
export function toSaturnFrames(records: ReadonlyArray<Record<string, unknown>>): SaturnFrame[] {
  return records.map(toSaturnFrame).filter((f) => f.id && f.subjectId && f.imageUrl);
}

/** Record shape written to ss_saturn_storm_classifications (unique user + frame). */
export function buildSaturnClassificationRecord(userId: string, frameId: string, verdict: SaturnVerdict) {
  return { user: userId, frame: frameId, answer: verdict };
}

/** Pool record id, not a `saturn-*` static seed id (same rule as Landnam). */
export function isSaturnPoolFrameId(id: string): boolean {
  return id !== "" && !id.startsWith("saturn-");
}

/** Pick the next unseen frame; null when every loaded frame is already answered. */
export function pickNextSaturnFrame(frames: ReadonlyArray<SaturnFrame>, answered: ReadonlySet<string>): SaturnFrame | null {
  return frames.find((f) => !answered.has(f.id)) ?? null;
}

export async function submitSaturnClassification(frameId: string, verdict: SaturnVerdict): Promise<boolean> {
  if (!isSaturnPoolFrameId(frameId)) return false;
  try {
    const res = await fetch("/api/gameplay/saturn-storm/classify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ frame: frameId, answer: verdict }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
