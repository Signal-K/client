import { describe, expect, it } from "vitest";

import { fetchClassificationsForVoting } from "@/src/lib/gameplay/classification-list";

function createSupabaseResult(data: any, error: any = null) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: async () => ({ data, error }),
        }),
      }),
    }),
  };
}

describe("classification-list helper", () => {
  it("maps rows with images and votes", async () => {
    const supabase = createSupabaseResult([
      { id: 1, media: { uploadUrl: "a.png" }, classificationConfiguration: { votes: 4 } },
      { id: 2, media: null, classificationConfiguration: null },
    ]);

    const rows = await fetchClassificationsForVoting({
      supabase,
      classificationType: "cloud",
      getImages: (media) => (media && typeof media === "object" && "uploadUrl" in media ? [(media as any).uploadUrl] : []),
    });

    expect(rows).toHaveLength(2);
    expect(rows[0].images).toEqual(["a.png"]);
    expect(rows[0].votes).toBe(4);
    expect(rows[1].votes).toBe(0);
  });

  it("throws when supabase query returns error", async () => {
    const supabase = createSupabaseResult(null, new Error("db failed"));

    await expect(
      fetchClassificationsForVoting({
        supabase,
        classificationType: "cloud",
        getImages: () => [],
      })
    ).rejects.toThrow("db failed");
  });

  it("returns empty array when data is null and no error", async () => {
    const supabase = createSupabaseResult(null, null);

    const rows = await fetchClassificationsForVoting({
      supabase,
      classificationType: "cloud",
      getImages: () => [],
    });

    expect(rows).toEqual([]);
  });
});
