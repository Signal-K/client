import { describe, expect, it } from "vitest";
import { SPACE_WEEK_LINKS, activeSkyCards, spaceWeekOpen } from "./skyEvents";

const at = (iso: string) => Date.parse(iso);

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
    expect(activeSkyCards(Number.NaN)).toEqual([]);
  });
});

describe("spaceWeekOpen", () => {
  it("is open from 4 Oct until the cards come down", () => {
    expect(spaceWeekOpen(at("2026-10-03T23:59:59Z"))).toBe(false);
    expect(spaceWeekOpen(at("2026-10-04T00:00:00Z"))).toBe(true);
    expect(spaceWeekOpen(at("2026-10-10T12:00:00Z"))).toBe(true);
    expect(spaceWeekOpen(at("2026-10-12T00:00:00Z"))).toBe(false);
  });
});

describe("SPACE_WEEK_LINKS", () => {
  it("links to the other two games over https", () => {
    expect(SPACE_WEEK_LINKS.map((l) => new URL(l.href).host)).toEqual(["youratlas.cc", "playlandnam.space"]);
  });
});
