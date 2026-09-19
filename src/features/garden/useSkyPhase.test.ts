import { describe, expect, it } from "vitest";
import { skyPhaseForHour } from "./useSkyPhase";

describe("skyPhaseForHour", () => {
  it("follows local time instead of a 14s loop", () => {
    expect(skyPhaseForHour(6)).toBe("dawn");
    expect(skyPhaseForHour(12)).toBe("day");
    expect(skyPhaseForHour(18)).toBe("dusk");
    expect(skyPhaseForHour(23)).toBe("night");
    expect(skyPhaseForHour(2)).toBe("night");
  });
});
