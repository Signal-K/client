import { beforeEach, describe, expect, it, vi } from "vitest";

import { resetPocketbaseToken } from "./pocketbase";
import { buildResearchSummary, emptySummary } from "./research";

const env = { POCKETBASE_URL: "https://pb.test", POCKETBASE_ADMIN_EMAIL: "a@b.c", POCKETBASE_ADMIN_PASSWORD: "x" };

function pocketbase(data: { classifications: string[]; total?: number; techs?: string[]; referralCode?: string | null }) {
  const reads: string[] = [];
  const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.pathname.includes("auth-with-password")) return new Response(JSON.stringify({ token: "t" }));
    const collection = url.pathname.split("/")[3];
    reads.push(`${collection}?${decodeURIComponent(url.search)}`);
    const page = (items: unknown[], totalItems = items.length) => new Response(JSON.stringify({ items, totalItems }));
    if (collection === "ss_classifications") {
      const typeFilter = url.searchParams.get("filter")?.match(/classificationtype="([^"]+)"/)?.[1];
      if (typeFilter) return page([], data.classifications.filter((t) => t === typeFilter).length);
      const cap = Number(url.searchParams.get("perPage"));
      return page(data.classifications.slice(0, cap).map((classificationtype) => ({ classificationtype })), data.total ?? data.classifications.length);
    }
    if (collection === "researched") return page((data.techs ?? []).map((techType) => ({ techType, createdAt: "t" })));
    if (collection === "survey_rewards") return page([{ stardustGranted: 3 }, { stardustGranted: null }]);
    if (collection === "profiles") return page(data.referralCode ? [{ referralCode: data.referralCode }] : []);
    if (collection === "referrals") return page([], 2);
    throw new Error(collection);
  });
  return { fetchImpl, reads };
}

describe("research summary", () => {
  beforeEach(() => resetPocketbaseToken());

  it("matches the Next route's maths using five light reads", async () => {
    const { fetchImpl, reads } = pocketbase({
      classifications: ["planet", "planet", "cloud", "telescope-minorPlanet", "other"],
      techs: ["probereceptors", "spectroscopy", "cloudspotting"],
      referralCode: "REF",
    });
    const summary = await buildResearchSummary(env, "user_1", fetchImpl as unknown as typeof fetch);
    expect(summary.counts).toEqual({ all: 5, asteroid: 1, cloud: 1, planet: 2 });
    expect(summary.referralCount).toBe(2);
    expect(summary.referralBonus).toBe(10);
    expect(summary.surveyBonus).toBe(3);
    // 5 classifications + 3 survey - (10 for a quantity upgrade + 2 + 2)
    expect(summary.availableStardust).toBe(0);
    expect(summary.upgrades).toMatchObject({ telescopeReceptors: 2, spectroscopyUnlocked: true });
    expect(summary.skillTree.unlockedSkills).toEqual(["cloudspotting"]);
    expect(reads).toHaveLength(5);
    expect(reads.find((r) => r.startsWith("ss_classifications"))).toContain("fields=classificationtype");
  });

  it("skips the referral count when the player has no code", async () => {
    const { fetchImpl, reads } = pocketbase({ classifications: [] });
    const summary = await buildResearchSummary(env, "user_1", fetchImpl as unknown as typeof fetch);
    expect(summary.referralCode).toBeNull();
    expect(reads.some((r) => r.startsWith("referrals"))).toBe(false);
    expect(reads).toHaveLength(4);
  });

  it("falls back to exact per-type counts only for players beyond one page", async () => {
    const many = Array.from({ length: 600 }, (_, i) => (i < 400 ? "planet" : "cloud"));
    const { fetchImpl, reads } = pocketbase({ classifications: many });
    const summary = await buildResearchSummary(env, "user_1", fetchImpl as unknown as typeof fetch);
    expect(summary.counts).toEqual({ all: 600, asteroid: 0, cloud: 200, planet: 400 });
    expect(reads.filter((r) => r.startsWith("ss_classifications"))).toHaveLength(4);
  });

  it("scopes every read to the verified user", async () => {
    const { fetchImpl, reads } = pocketbase({ classifications: [] });
    await buildResearchSummary(env, 'user_1" || id!="', fetchImpl as unknown as typeof fetch);
    for (const read of reads.filter((r) => !r.startsWith("referrals"))) expect(read).not.toContain('" ||');
  });

  it("exposes the signed-out shape", () => {
    expect(emptySummary()).toMatchObject({ authenticated: false, counts: { all: 0 } });
  });
});
