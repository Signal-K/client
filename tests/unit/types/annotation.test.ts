import { describe, it, expect } from "vitest";
import {
  CoMCATEGORIES,
  JVHCATEGORIES,
  P4CATEGORIES,
  AI4MCATEGORIES,
  SunspotsCategories,
  PHCATEGORIES,
  NGTSCATEGORIES,
  CoMSCategories,
  CACCategories,
  ActiveAsteroidsCategories,
} from "@/src/types/Annotation";

describe("CoMCATEGORIES", () => {
  it("has Peak and Custom categories", () => {
    expect(CoMCATEGORIES).toHaveProperty("Peak");
    expect(CoMCATEGORIES).toHaveProperty("Custom");
  });

  it("Peak has correct color", () => {
    expect(CoMCATEGORIES.Peak.color).toBe("#ACAF50");
  });
});

describe("JVHCATEGORIES", () => {
  it("has Vortex and Null categories", () => {
    expect(JVHCATEGORIES).toHaveProperty("Vortex");
    expect(JVHCATEGORIES).toHaveProperty("Null");
  });

  it("all entries have name and color", () => {
    for (const val of Object.values(JVHCATEGORIES)) {
      expect(typeof val.name).toBe("string");
      expect(typeof val.color).toBe("string");
    }
  });
});

describe("P4CATEGORIES", () => {
  it("has fan, blotch, Custom", () => {
    expect(P4CATEGORIES).toHaveProperty("fan");
    expect(P4CATEGORIES).toHaveProperty("blotch");
    expect(P4CATEGORIES).toHaveProperty("Custom");
  });
});

describe("AI4MCATEGORIES", () => {
  it("has 5 entries including sand and bedrock", () => {
    expect(AI4MCATEGORIES).toHaveProperty("sand");
    expect(AI4MCATEGORIES).toHaveProperty("bedrock");
    expect(Object.keys(AI4MCATEGORIES)).toHaveLength(5);
  });
});

describe("SunspotsCategories", () => {
  it("has Sunspot and Other", () => {
    expect(SunspotsCategories).toHaveProperty("Sunspot");
    expect(SunspotsCategories).toHaveProperty("Other");
  });
});

describe("PHCATEGORIES", () => {
  it("has Noise and Clear dip", () => {
    expect(PHCATEGORIES).toHaveProperty("Noise");
    expect(PHCATEGORIES).toHaveProperty("Clear dip");
  });
});

describe("NGTSCATEGORIES", () => {
  it("has Yes and No", () => {
    expect(NGTSCATEGORIES).toHaveProperty("Yes");
    expect(NGTSCATEGORIES).toHaveProperty("No");
    expect(NGTSCATEGORIES.Yes.color).toBe("#4CAF50");
    expect(NGTSCATEGORIES.No.color).toBe("#F44336");
  });
});

describe("CoMSCategories", () => {
  it("has 10 cloud types", () => {
    expect(Object.keys(CoMSCategories)).toHaveLength(10);
  });

  it("Ozone entry has correct color", () => {
    expect(CoMSCategories.Ozone.color).toBe("#ff3398");
  });
});

describe("CACCategories", () => {
  it("has 13 coral/fish entries", () => {
    expect(Object.keys(CACCategories)).toHaveLength(13);
  });

  it("Fish entry exists with orange color", () => {
    expect(CACCategories.Fish.color).toBe("#FF9800");
  });
});

describe("ActiveAsteroidsCategories", () => {
  it("has Tail, Coma, FalsePositive", () => {
    expect(ActiveAsteroidsCategories).toHaveProperty("Tail");
    expect(ActiveAsteroidsCategories).toHaveProperty("Coma");
    expect(ActiveAsteroidsCategories).toHaveProperty("FalsePositive");
  });
});
