import { describe, expect, it, vi, beforeEach } from "vitest";

import {
  SATURN_QUESTION,
  buildSaturnClassificationRecord,
  isSaturnPoolFrameId,
  pickNextSaturnFrame,
  submitSaturnClassification,
  toSaturnFrame,
  toSaturnFrames,
} from "./saturnStorm";
import { fetchSaturnFrames, resetSaturnFramesCache } from "@/src/features/garden/useSaturnFrames";

describe("saturn storm pool mapping", () => {
  it("maps a pool record like Landnam's toSaturnCandidate", () => {
    expect(toSaturnFrame({ id: "abc", subject_id: 12, opus_id: "co-iss-n1", image_url: "https://x/y.png" })).toEqual({
      id: "abc", subjectId: "12", opusId: "co-iss-n1", imageUrl: "https://x/y.png",
    });
  });
  it("drops frames without subject or image", () => {
    expect(toSaturnFrames([{ id: "a", subject_id: "1", image_url: "" }, { id: "b", subject_id: "2", image_url: "u" }]).map((f) => f.id)).toEqual(["b"]);
  });
  it("builds the classification record", () => {
    expect(buildSaturnClassificationRecord("u1", "f1", "maybe")).toEqual({ user: "u1", frame: "f1", answer: "maybe" });
  });
  it("distinguishes pool ids from seeds", () => {
    expect(isSaturnPoolFrameId("yw1xzyv6e20lm4d")).toBe(true);
    expect(isSaturnPoolFrameId("saturn-1")).toBe(false);
    expect(isSaturnPoolFrameId("")).toBe(false);
  });
  it("skips answered frames", () => {
    const frames = toSaturnFrames([{ id: "a", subject_id: "1", image_url: "u" }, { id: "b", subject_id: "2", image_url: "u" }]);
    expect(pickNextSaturnFrame(frames, new Set(["a"]))?.id).toBe("b");
    expect(pickNextSaturnFrame(frames, new Set(["a", "b"]))).toBeNull();
  });
  it("uses the exact question text", () => {
    expect(SATURN_QUESTION).toBe("Is there a storm cloud in the image?");
  });
});

describe("saturn pool network helpers", () => {
  beforeEach(() => {
    resetSaturnFramesCache();
    vi.unstubAllGlobals();
  });
  it("returns [] when the frames route fails or throws", async () => {
    expect(await fetchSaturnFrames((async () => ({ ok: false })) as unknown as typeof fetch)).toEqual([]);
    expect(await fetchSaturnFrames((async () => { throw new Error("offline"); }) as unknown as typeof fetch)).toEqual([]);
  });
  it("maps frames from the route", async () => {
    const f = (async () => ({ ok: true, json: async () => [{ id: "a", subject_id: "1", opus_id: "o", image_url: "u" }] })) as unknown as typeof fetch;
    expect((await fetchSaturnFrames(f))[0].id).toBe("a");
  });
  it("posts pool answers and skips seed ids", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await submitSaturnClassification("saturn-1", "yes")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(await submitSaturnClassification("abc", "yes")).toBe(true);
    expect(JSON.parse((fetchMock.mock.calls[0] as unknown as [string, { body: string }])[1].body)).toEqual({ frame: "abc", answer: "yes" });
  });
});
