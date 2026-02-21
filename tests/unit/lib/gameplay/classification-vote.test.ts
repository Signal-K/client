import { describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/gameplay/classification-configuration", () => ({
  updateClassificationConfiguration: vi.fn(),
}));

import { incrementClassificationVote } from "@/src/lib/gameplay/classification-vote";
import { updateClassificationConfiguration } from "@/src/lib/gameplay/classification-configuration";

describe("classification-vote helper", () => {
  it("returns returned votes when API includes votes", async () => {
    vi.mocked(updateClassificationConfiguration).mockResolvedValue({
      ok: true,
      classificationConfiguration: { votes: 7 },
    });

    const result = await incrementClassificationVote(10, 2);
    expect(result).toBe(7);
  });

  it("falls back to local increment when votes missing", async () => {
    vi.mocked(updateClassificationConfiguration).mockResolvedValue({
      ok: true,
      classificationConfiguration: {},
    });

    const result = await incrementClassificationVote(10, 2);
    expect(result).toBe(3);
  });

  it("returns null when update call fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(updateClassificationConfiguration).mockResolvedValue({
      ok: false,
      error: "failed",
    });

    const result = await incrementClassificationVote(10, 2);
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
