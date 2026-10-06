import { describe, expect, it } from "vitest";
import {
  SATURN_EVENT_ID,
  activeSkyCards,
  badgeTierFor,
  grantSkyBadge,
} from "./skyEvents";

const at = (iso: string) => Date.parse(iso);

describe("badgeTierFor", () => {
  it("is gold in the event period, silver after, null before", () => {
    expect(badgeTierFor(SATURN_EVENT_ID, at("2026-10-03T23:59:59Z"))).toBeNull();
    expect(badgeTierFor(SATURN_EVENT_ID, at("2026-10-07T12:00:00Z"))).toBe("gold");
    expect(badgeTierFor(SATURN_EVENT_ID, at("2026-10-11T00:00:00Z"))).toBe("silver");
    expect(badgeTierFor("nope", at("2026-10-07T12:00:00Z"))).toBeNull();
  });
});

describe("grantSkyBadge", () => {
  it("grants once and never downgrades gold", () => {
    const gold = grantSkyBadge(undefined, SATURN_EVENT_ID, at("2026-10-07T12:00:00Z"));
    expect(gold?.[SATURN_EVENT_ID].tier).toBe("gold");
    expect(grantSkyBadge(gold, SATURN_EVENT_ID, at("2026-10-20T12:00:00Z"))).toBe(gold);
  });

  it("upgrades silver to gold and ignores pre-event plays", () => {
    const silver = grantSkyBadge(undefined, SATURN_EVENT_ID, at("2026-10-15T00:00:00Z"));
    expect(silver?.[SATURN_EVENT_ID].tier).toBe("silver");
    expect(grantSkyBadge(silver, SATURN_EVENT_ID, at("2026-10-07T00:00:00Z"))?.[SATURN_EVENT_ID].tier).toBe("gold");
    expect(grantSkyBadge(undefined, SATURN_EVENT_ID, at("2026-10-01T00:00:00Z"))).toBeUndefined();
  });
});

describe("activeSkyCards", () => {
  it("pins each card on its own date and removes all after 11 Oct", () => {
    expect(activeSkyCards(at("2026-10-06T23:59:59Z"))).toEqual([]);
    expect(activeSkyCards(at("2026-10-07T00:00:00Z")).map((c) => c.id)).toEqual(["saturn-opposition"]);
    expect(activeSkyCards(at("2026-10-08T09:00:00Z")).map((c) => c.id)).toEqual(["saturn-opposition", "evening-shower"]);
    expect(activeSkyCards(at("2026-10-11T23:59:59Z")).map((c) => c.id)).toEqual([
      "saturn-opposition",
      "evening-shower",
      "dark-sky",
    ]);
    expect(activeSkyCards(at("2026-10-12T00:00:00Z"))).toEqual([]);
  });
});
