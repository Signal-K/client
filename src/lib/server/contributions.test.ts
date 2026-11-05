import { beforeEach, describe, expect, it, vi } from "vitest";

import { contributionDay, isContributionKind } from "@/src/lib/gameplay/contributions";
import { recordContribution, resetContributionMemo } from "./contributions";

const NOW = Date.UTC(2026, 10, 4, 12, 0, 0);

function fakePb(create: (record: unknown) => Promise<unknown>) {
  const spy = vi.fn(create);
  return {
    pb: { collection: (name: string) => ({ create: (r: unknown) => (name === "platform_contributions" ? spy(r) : Promise.reject(new Error(name))) }) } as never,
    spy,
  };
}

beforeEach(() => resetContributionMemo());

describe("contribution kinds and days", () => {
  it("accepts any well-formed kind", () => {
    expect(isContributionKind("classification")).toBe(true);
    expect(isContributionKind("event")).toBe(true);
    expect(isContributionKind("exchange-sale")).toBe(true);
    expect(isContributionKind("Exchange Sale")).toBe(false);
    expect(isContributionKind("")).toBe(false);
    expect(isContributionKind(undefined)).toBe(false);
  });

  it("uses the UTC day", () => {
    expect(contributionDay(Date.UTC(2026, 10, 4, 23, 59, 59))).toBe("2026-11-04");
    expect(contributionDay(Date.UTC(2026, 10, 5, 0, 0, 0))).toBe("2026-11-05");
  });
});

describe("recordContribution", () => {
  it("writes one row for the Clerk subject, game garden and the server's UTC day", async () => {
    const { pb, spy } = fakePb(async () => ({}));
    expect(await recordContribution(pb, "user_1", "classification", NOW)).toBe("recorded");
    expect(spy).toHaveBeenCalledWith({ userId: "user_1", game: "garden", kind: "classification", day: "2026-11-04" });
  });

  it("does not write again for the same player, kind and day", async () => {
    const { pb, spy } = fakePb(async () => ({}));
    await recordContribution(pb, "user_1", "classification", NOW);
    expect(await recordContribution(pb, "user_1", "classification", NOW + 3_600_000)).toBe("duplicate");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("writes again for another kind or the next day", async () => {
    const { pb, spy } = fakePb(async () => ({}));
    await recordContribution(pb, "user_1", "classification", NOW);
    await recordContribution(pb, "user_1", "event", NOW);
    await recordContribution(pb, "user_1", "classification", NOW + 86_400_000);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it("treats the unique key rejection as already counted, and remembers it", async () => {
    const { pb, spy } = fakePb(async () => Promise.reject({ status: 400 }));
    expect(await recordContribution(pb, "user_1", "classification", NOW)).toBe("duplicate");
    expect(await recordContribution(pb, "user_1", "classification", NOW)).toBe("duplicate");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("reports unavailable when the table is not deployed, then backs off for a minute", async () => {
    const { pb, spy } = fakePb(async () => Promise.reject({ status: 404 }));
    expect(await recordContribution(pb, "user_1", "classification", NOW)).toBe("unavailable");
    expect(await recordContribution(pb, "user_2", "classification", NOW + 30_000)).toBe("unavailable");
    expect(spy).toHaveBeenCalledTimes(1);
    expect(await recordContribution(pb, "user_2", "classification", NOW + 61_000)).toBe("unavailable");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("never throws and ignores a missing player", async () => {
    const { pb, spy } = fakePb(async () => Promise.reject(new Error("network")));
    await expect(recordContribution(pb, "user_1", "classification", NOW)).resolves.toBe("unavailable");
    expect(await recordContribution(pb, "", "classification", NOW + 120_000)).toBe("unavailable");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
