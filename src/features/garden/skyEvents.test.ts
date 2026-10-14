import { describe, expect, it } from "vitest";

import { SKY_EVENT_CARDS, activeSkyCards } from "./skyEvents";

const at = (value: string) => Date.parse(value);

describe("activeSkyCards", () => {
  it("reveals each card on its scheduled UTC day and removes them after 11 Oct", () => {
    expect(activeSkyCards(at("2026-10-06T23:59:59Z"))).toEqual([]);
    expect(activeSkyCards(at("2026-10-07T00:00:00Z")).map((card) => card.id)).toEqual(["saturn-opposition"]);
    expect(activeSkyCards(at("2026-10-08T00:00:00Z")).map((card) => card.id)).toEqual(["saturn-opposition", "evening-shower"]);
    expect(activeSkyCards(at("2026-10-10T00:00:00Z")).map((card) => card.id)).toEqual([
      "saturn-opposition",
      "evening-shower",
      "dark-sky",
    ]);
    expect(activeSkyCards(at("2026-10-12T00:00:00Z"))).toEqual([]);
  });

  it("uses HTTPS links and connects the drop to Atlas and Landnám", () => {
    const hrefs = SKY_EVENT_CARDS.flatMap((card) => card.links.map((link) => link.href));
    expect(hrefs.every((href) => href.startsWith("https://"))).toBe(true);
    expect(hrefs).toContain("https://youratlas.cc/app/profile");
    expect(hrefs).toContain("https://playlandnam.space/game");
  });
});
