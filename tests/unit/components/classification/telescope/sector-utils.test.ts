import { describe, it, expect } from "vitest";
import {
  generateSectorName,
  seededRandom,
  generateStars,
  filterAnomaliesBySector,
} from "@/components/classification/telescope/utils/sector-utils";

describe("seededRandom", () => {
  it("returns a number between 0 and 1", () => {
    for (let i = 0; i < 100; i++) {
      const val = seededRandom(42, i);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it("is deterministic for same seed and index", () => {
    expect(seededRandom(42, 0)).toBe(seededRandom(42, 0));
    expect(seededRandom(42, 5)).toBe(seededRandom(42, 5));
    expect(seededRandom(123, 10)).toBe(seededRandom(123, 10));
  });

  it("produces different values for different seeds", () => {
    expect(seededRandom(1, 0)).not.toBe(seededRandom(2, 0));
  });

  it("produces different values for different indices", () => {
    expect(seededRandom(42, 0)).not.toBe(seededRandom(42, 1));
  });
});

describe("generateSectorName", () => {
  it("returns a string with two parts", () => {
    const name = generateSectorName(0, 0);
    expect(name.split(" ").length).toBe(2);
  });

  it("is deterministic for same coordinates", () => {
    expect(generateSectorName(500, 300)).toBe(generateSectorName(500, 300));
  });

  it("first part is a Greek letter", () => {
    const greekLetters = [
      "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta",
      "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu",
      "Nu", "Xi", "Omicron", "Pi",
    ];
    const [first] = generateSectorName(100, 200).split(" ");
    expect(greekLetters).toContain(first);
  });

  it("second part is a region type", () => {
    const regions = ["Nebula", "Cluster", "Field", "Void", "Stream", "Cloud", "Ring", "Arm"];
    const [, second] = generateSectorName(100, 200).split(" ");
    expect(regions).toContain(second);
  });

  it("handles negative coordinates", () => {
    const name = generateSectorName(-500, -300);
    expect(name.split(" ").length).toBe(2);
  });

  it("handles zero coordinates", () => {
    const name = generateSectorName(0, 0);
    expect(typeof name).toBe("string");
    expect(name.length).toBeGreaterThan(0);
  });
});

describe("generateStars", () => {
  it("returns 400 stars", () => {
    const stars = generateStars(0, 0);
    expect(stars).toHaveLength(400);
  });

  it("is deterministic for same sector", () => {
    const stars1 = generateStars(1, 2);
    const stars2 = generateStars(1, 2);
    expect(stars1).toEqual(stars2);
  });

  it("produces different stars for different sectors", () => {
    const stars1 = generateStars(0, 0);
    const stars2 = generateStars(1, 0);
    expect(stars1[0].x).not.toBe(stars2[0].x);
  });

  it("each star has required properties", () => {
    const stars = generateStars(5, 5);
    stars.forEach((star) => {
      expect(star).toHaveProperty("x");
      expect(star).toHaveProperty("y");
      expect(star).toHaveProperty("size");
      expect(star).toHaveProperty("opacity");
      expect(star).toHaveProperty("color");
      expect(star).toHaveProperty("twinkleSpeed");
    });
  });

  it("star positions are in valid range (0-100)", () => {
    const stars = generateStars(3, 7);
    stars.forEach((star) => {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(100);
      expect(star.y).toBeGreaterThanOrEqual(0);
      expect(star.y).toBeLessThanOrEqual(100);
    });
  });

  it("star colors are valid hex strings from palette", () => {
    const validColors = [
      "#FFE4B5", "#87CEEB", "#FFB6C1", "#98FB98", "#DDA0DD",
      "#F0E68C", "#FFA07A", "#20B2AA", "#FFFFFF", "#FFFACD",
    ];
    const stars = generateStars(2, 4);
    stars.forEach((star) => {
      expect(validColors).toContain(star.color);
    });
  });
});

describe("filterAnomaliesBySector", () => {
  it("returns anomalies matching the sector name", () => {
    const sectorName = generateSectorName(0, 0);
    const anomalies = [
      { id: "1", sector: sectorName, name: "A" },
      { id: "2", sector: "Other Sector", name: "B" },
      { id: "3", sector: sectorName, name: "C" },
    ] as any;

    const filtered = filterAnomaliesBySector(anomalies, 0, 0);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].name).toBe("A");
    expect(filtered[1].name).toBe("C");
  });

  it("returns empty array when no anomalies match", () => {
    const anomalies = [
      { id: "1", sector: "Nonexistent Sector", name: "X" },
    ] as any;
    const filtered = filterAnomaliesBySector(anomalies, 999, 999);
    expect(filtered).toHaveLength(0);
  });

  it("handles empty anomalies array", () => {
    const filtered = filterAnomaliesBySector([], 0, 0);
    expect(filtered).toEqual([]);
  });
});
