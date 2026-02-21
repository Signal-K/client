import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  mergeClassificationConfiguration,
  updateClassificationConfiguration,
} from "@/src/lib/gameplay/classification-configuration";

describe("classification-configuration helper", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns success payload when API responds 200", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ classificationConfiguration: { votes: 11 } }),
    } as Response);

    const result = await updateClassificationConfiguration({
      classificationId: 42,
      action: "increment_vote",
    });

    expect(result).toEqual({
      ok: true,
      classificationConfiguration: { votes: 11 },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/gameplay/classifications/configuration",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns error when API responds non-200", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "bad request" }),
    } as Response);

    const result = await mergeClassificationConfiguration(9, { cloudData: [] });

    expect(result).toEqual({
      ok: false,
      error: "bad request",
    });
  });

  it("returns error when fetch throws", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new Error("network down"));

    const result = await updateClassificationConfiguration({
      classificationId: 1,
      action: "merge",
      patch: { a: 1 },
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain("network down");
  });
});
