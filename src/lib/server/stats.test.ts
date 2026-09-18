import { describe, expect, it } from "vitest";

import { uniqueNonEmptyStrings } from "./stats";

describe("uniqueNonEmptyStrings", () => {
  it("counts unique non-empty strings only", () => {
    expect(uniqueNonEmptyStrings(["a", "b", "a", "", null, undefined, 3])).toBe(2);
  });

  it("returns 0 for an empty scan", () => {
    expect(uniqueNonEmptyStrings([])).toBe(0);
  });
});
