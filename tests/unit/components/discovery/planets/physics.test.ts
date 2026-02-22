import { describe, it, expect } from "vitest";
import {
  getLiquidType,
  getDepositVisuals,
  getMineralState,
} from "@/components/discovery/planets/physics";

describe("getLiquidType", () => {
  it.each([
    [50, "Liquid Nitrogen", "#D6E7FF", "#C0D6FF"],
    [89, "Liquid Nitrogen", "#D6E7FF", "#C0D6FF"],
    [90, "Liquid Methane", "#A2CDB0", "#8EBDA0"],
    [119, "Liquid Methane", "#A2CDB0", "#8EBDA0"],
    [120, "Water", "#1E90FF", "#1E7FFF"],
    [288, "Water", "#1E90FF", "#1E7FFF"],
    [372, "Water", "#1E90FF", "#1E7FFF"],
    [373, "Sulfuric Acid", "#D6C562", "#C4B250"],
    [500, "Sulfuric Acid", "#D6C562", "#C4B250"],
    [599, "Sulfuric Acid", "#D6C562", "#C4B250"],
    [600, "Molten Rock", "#FF4500", "#FF2400"],
    [1500, "Molten Rock", "#FF4500", "#FF2400"],
  ])(
    "returns %s at temperature %dK",
    (temp, name, color, patternColor) => {
      const result = getLiquidType(temp);
      expect(result).toEqual({ name, color, patternColor });
    }
  );

  it("handles boundary at 0K", () => {
    expect(getLiquidType(0).name).toBe("Liquid Nitrogen");
  });

  it("handles very high temperatures", () => {
    expect(getLiquidType(10000).name).toBe("Molten Rock");
  });
});

describe("getMineralState", () => {
  it.each([
    ["water-ice", 100, "solid"],
    ["water-ice", 273, "liquid"],
    ["water-ice", 373, "gas"],
    ["water-ice", 1000, "plasma"],
    ["co2-ice", 100, "solid"],
    ["co2-ice", 195, "liquid"],
    ["co2-ice", 216, "gas"],
    ["co2-ice", 600, "plasma"],
    ["metallic-hydrogen", 10, "solid"],
    ["metallic-hydrogen", 14, "liquid"],
    ["metallic-hydrogen", 33, "gas"],
    ["metallic-hydrogen", 5000, "plasma"],
    ["methane", 50, "solid"],
    ["methane", 91, "liquid"],
    ["methane", 112, "gas"],
    ["methane", 600, "plasma"],
    ["iron-ore", 1000, "solid"],
    ["iron-ore", 1811, "liquid"],
    ["iron-ore", 3134, "gas"],
    ["iron-ore", 5000, "plasma"],
    ["gold-ore", 1000, "solid"],
    ["gold-ore", 1337, "liquid"],
    ["gold-ore", 3243, "gas"],
    ["gold-ore", 5000, "plasma"],
    ["carbon", 3000, "solid"],
    ["carbon", 3823, "liquid"],
    ["carbon", 4098, "gas"],
    ["carbon", 5000, "plasma"],
  ] as [string, number, string][])(
    "%s at %dK is %s",
    (type, temp, expected) => {
      expect(getMineralState(type as any, temp)).toBe(expected);
    }
  );

  it("returns solid for unknown mineral type", () => {
    expect(getMineralState("unknown-mineral" as any, 500)).toBe("solid");
  });

  it("returns solid at absolute zero for all types", () => {
    const types = [
      "water-ice", "co2-ice", "metallic-hydrogen", "metallic-helium",
      "methane", "ammonia", "soil", "dust", "water-vapour",
      "iron-ore", "copper-ore", "gold-ore", "silicate", "carbon",
    ];
    types.forEach((type) => {
      expect(getMineralState(type as any, 0)).toBe("solid");
    });
  });
});

describe("getDepositVisuals", () => {
  it("returns correct visuals for water-ice solid", () => {
    const result = getDepositVisuals("water-ice", "solid", 100);
    expect(result).toEqual({
      color: "#B4E7FF",
      emissive: "#88CCFF",
      intensity: 0.3,
    });
  });

  it("returns correct visuals for gold-ore plasma", () => {
    const result = getDepositVisuals("gold-ore", "plasma", 10000);
    expect(result).toEqual({
      color: "#FF00FF",
      emissive: "#FF00FF",
      intensity: 0.9,
    });
  });

  it("returns correct visuals for iron-ore liquid", () => {
    const result = getDepositVisuals("iron-ore", "liquid", 2000);
    expect(result).toEqual({
      color: "#FF4500",
      emissive: "#FF6347",
      intensity: 0.6,
    });
  });

  it("returns correct visuals for carbon solid", () => {
    const result = getDepositVisuals("carbon", "solid", 300);
    expect(result).toEqual({
      color: "#2F4F4F",
      emissive: "#000000",
      intensity: 0.05,
    });
  });

  it("returns fallback for unknown type", () => {
    const result = getDepositVisuals("unknown" as any, "solid", 300);
    expect(result).toEqual({
      color: "#808080",
      emissive: "#404040",
      intensity: 0.2,
    });
  });

  it("returns fallback for unknown state", () => {
    const result = getDepositVisuals("water-ice", "unknown" as any, 300);
    expect(result).toEqual({
      color: "#808080",
      emissive: "#404040",
      intensity: 0.2,
    });
  });

  it.each([
    "water-ice", "co2-ice", "metallic-hydrogen", "metallic-helium",
    "methane", "ammonia", "soil", "dust", "water-vapour",
    "iron-ore", "copper-ore", "gold-ore", "silicate", "carbon",
  ] as const)("returns valid visuals for %s in all states", (type) => {
    (["solid", "liquid", "gas", "plasma"] as const).forEach((state) => {
      const result = getDepositVisuals(type, state, 300);
      expect(result.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(result.emissive).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(result.intensity).toBeGreaterThanOrEqual(0);
      expect(result.intensity).toBeLessThanOrEqual(1);
    });
  });
});
