import { describe, it, expect } from "vitest";
import {
  jvhOptions,
  DailyMinorPlanetOptions,
  activeAsteroidsOptions,
  PlanetFourOptions,
  automatonaiForMarsOptions,
} from "@/src/components/classification/Options";

describe("Classification Options", () => {
  describe("jvhOptions (Jovian Vortex Hunter)", () => {
    it("has exactly 4 options", () => {
      expect(jvhOptions).toHaveLength(4);
    });

    it("has unique IDs", () => {
      const ids = jvhOptions.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all options have non-empty text", () => {
      jvhOptions.forEach((o) => {
        expect(o.text.trim().length).toBeGreaterThan(0);
      });
    });

    it("contains Vortex option", () => {
      expect(jvhOptions.some((o) => o.text === "Vortex")).toBe(true);
    });

    it("contains Cloud bands option", () => {
      expect(jvhOptions.some((o) => o.text === "Cloud bands")).toBe(true);
    });
  });

  describe("DailyMinorPlanetOptions", () => {
    it("has exactly 3 options", () => {
      expect(DailyMinorPlanetOptions).toHaveLength(3);
    });

    it("has unique IDs", () => {
      const ids = DailyMinorPlanetOptions.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("all options have non-empty text", () => {
      DailyMinorPlanetOptions.forEach((o) => {
        expect(o.text.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe("activeAsteroidsOptions", () => {
    it("has exactly 3 options", () => {
      expect(activeAsteroidsOptions).toHaveLength(3);
    });

    it("has unique IDs", () => {
      const ids = activeAsteroidsOptions.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("contains 'Hot' option", () => {
      expect(activeAsteroidsOptions.some((o) => o.text.startsWith("Hot – shows"))).toBe(true);
    });

    it("contains 'Not' option", () => {
      expect(activeAsteroidsOptions.some((o) => o.text.startsWith("Not – no"))).toBe(true);
    });
  });

  describe("PlanetFourOptions", () => {
    it("has exactly 5 options", () => {
      expect(PlanetFourOptions).toHaveLength(5);
    });

    it("has unique IDs", () => {
      const ids = PlanetFourOptions.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("contains Dust Deposits", () => {
      expect(PlanetFourOptions.some((o) => o.text === "Dust Deposits")).toBe(true);
    });

    it("contains Smooth Terrain", () => {
      expect(PlanetFourOptions.some((o) => o.text === "Smooth Terrain")).toBe(true);
    });
  });

  describe("automatonaiForMarsOptions", () => {
    it("has exactly 5 options", () => {
      expect(automatonaiForMarsOptions).toHaveLength(5);
    });

    it("has unique IDs", () => {
      const ids = automatonaiForMarsOptions.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("contains Big rocks option", () => {
      expect(automatonaiForMarsOptions.some((o) => o.text === "Big rocks")).toBe(true);
    });

    it("contains Unlabelled option", () => {
      expect(automatonaiForMarsOptions.some((o) => o.text === "Unlabelled")).toBe(true);
    });
  });
});
