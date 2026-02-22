import { describe, it, expect } from "vitest";
import {
  defaultPlanetConfig,
  getLiquidType,
  getTemperatureAdjustedColors,
} from "@/components/discovery/planets/planet-config";

describe("defaultPlanetConfig", () => {
  it("has correct default values", () => {
    expect(defaultPlanetConfig.type).toBe("terrestrial");
    expect(defaultPlanetConfig.seed).toBe(9123);
    expect(defaultPlanetConfig.radius).toBe(1.2);
    expect(defaultPlanetConfig.temperature).toBe(267);
    expect(defaultPlanetConfig.biomass).toBe(0.96);
    expect(defaultPlanetConfig.mass).toBe(2);
    expect(defaultPlanetConfig.terrainRoughness).toBe(0.6);
    expect(defaultPlanetConfig.liquidHeight).toBe(0.55);
    expect(defaultPlanetConfig.volcanicActivity).toBe(0.2);
    expect(defaultPlanetConfig.continentSize).toBe(0.5);
    expect(defaultPlanetConfig.continentCount).toBe(5);
    expect(defaultPlanetConfig.noiseScale).toBe(1);
    expect(defaultPlanetConfig.debugMode).toBe(true);
  });

  it("has all visible terrain keys set to false", () => {
    const terrains = defaultPlanetConfig.visibleTerrains;
    expect(terrains.ocean).toBe(false);
    expect(terrains.beach).toBe(false);
    expect(terrains.lowland).toBe(false);
    expect(terrains.midland).toBe(false);
    expect(terrains.highland).toBe(false);
    expect(terrains.mountain).toBe(false);
    expect(terrains.snow).toBe(false);
  });

  it("has valid hex color strings for all color keys", () => {
    const { colors } = defaultPlanetConfig;
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    Object.values(colors).forEach((color) => {
      expect(color).toMatch(hexRegex);
    });
  });
});

describe("getLiquidType (planet-config)", () => {
  it.each([
    [50, "Liquid Nitrogen"],
    [100, "Liquid Methane"],
    [200, "Water"],
    [400, "Sulfuric Acid"],
    [700, "Molten Rock"],
  ])("at %dK returns %s", (temp, expectedName) => {
    expect(getLiquidType(temp).name).toBe(expectedName);
  });

  it("returns color and patternColor as hex strings", () => {
    const result = getLiquidType(300);
    expect(result.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(result.patternColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("getTemperatureAdjustedColors", () => {
  it("returns frozen colors for very cold planets (<200K)", () => {
    const colors = getTemperatureAdjustedColors(100, 0.5);
    expect(colors.beach).toBe("#E0E0FF");
    expect(colors.snow).toBe("#F0F8FF");
  });

  it("returns frozen vegetation for cold planets with biomass >0.1", () => {
    const colors = getTemperatureAdjustedColors(100, 0.5);
    expect(colors.lowland).toBe("#B0C4DE");
  });

  it("returns icy lowland for cold planets with biomass <=0.1", () => {
    const colors = getTemperatureAdjustedColors(100, 0.05);
    expect(colors.lowland).toBe("#DCDCDC");
  });

  it("returns tundra colors for cold planets (200-273K)", () => {
    const colors = getTemperatureAdjustedColors(250, 0.5);
    expect(colors.beach).toBe("#D2B48C");
    expect(colors.snow).toBe("#FFFAFA");
  });

  it("returns sparse vegetation for tundra with biomass >0.3", () => {
    const colors = getTemperatureAdjustedColors(250, 0.5);
    expect(colors.lowland).toBe("#9ACD32");
  });

  it("returns permafrost for tundra with biomass <=0.3", () => {
    const colors = getTemperatureAdjustedColors(250, 0.1);
    expect(colors.lowland).toBe("#F5F5DC");
  });

  it("returns earth-like colors for temperate planets (273-350K)", () => {
    const colors = getTemperatureAdjustedColors(300, 0.5);
    // With moderate biomass, uses base colors
    expect(colors.beach).toBe("#F0E68C");
    expect(colors.snow).toBe("#FFFFFF");
  });

  it("returns desert colors for temperate low-biomass (<0.1)", () => {
    const colors = getTemperatureAdjustedColors(300, 0.05);
    expect(colors.lowland).toBe("#D2B48C");
    expect(colors.midland).toBe("#CD853F");
  });

  it("returns lush colors for temperate high-biomass (>0.8)", () => {
    const colors = getTemperatureAdjustedColors(300, 0.9);
    expect(colors.lowland).toBe("#228B22");
    expect(colors.midland).toBe("#006400");
  });

  it("returns arid colors for hot planets (350-500K)", () => {
    const colors = getTemperatureAdjustedColors(400, 0.0);
    expect(colors.beach).toBe("#DEB887");
    expect(colors.mountain).toBe("#696969");
  });

  it("returns volcanic colors for very hot planets (500-700K)", () => {
    const colors = getTemperatureAdjustedColors(600, 0.0);
    expect(colors.beach).toBe("#CD853F");
    expect(colors.highland).toBe("#800000");
    expect(colors.snow).toBe("#D3D3D3");
  });

  it("returns hellish colors for extremely hot planets (>700K)", () => {
    const colors = getTemperatureAdjustedColors(800, 0.0);
    expect(colors.beach).toBe("#FF6347");
    expect(colors.lowland).toBe("#FF4500");
    expect(colors.midland).toBe("#DC143C");
    expect(colors.snow).toBe("#D0D0D0");
  });

  it("always returns all six terrain keys", () => {
    const temps = [50, 150, 250, 300, 400, 600, 900];
    temps.forEach((t) => {
      const result = getTemperatureAdjustedColors(t, 0.5);
      expect(Object.keys(result)).toEqual(
        expect.arrayContaining(["beach", "lowland", "midland", "highland", "mountain", "snow"])
      );
    });
  });
});
