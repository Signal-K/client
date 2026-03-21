import { describe, it, expect, vi } from "vitest";
import { captureCrossGameNavigation } from "@/src/features/analytics/cross-game-navigation";

describe("captureCrossGameNavigation", () => {
  it("calls posthog.capture with the correct event name and payload", () => {
    const capture = vi.fn();
    captureCrossGameNavigation({ capture }, { destination: "saily", source_section: "referral_card" });
    expect(capture).toHaveBeenCalledWith("cross_game_navigation", {
      destination: "saily",
      source_section: "referral_card",
    });
  });

  it("includes optional user_id when provided", () => {
    const capture = vi.fn();
    captureCrossGameNavigation(
      { capture },
      { destination: "ecosystem", source_section: "nav", user_id: "user-123" }
    );
    expect(capture).toHaveBeenCalledWith("cross_game_navigation", {
      destination: "ecosystem",
      source_section: "nav",
      user_id: "user-123",
    });
  });

  it("does not throw when posthog is null", () => {
    expect(() =>
      captureCrossGameNavigation(null, { destination: "saily", source_section: "test" })
    ).not.toThrow();
  });

  it("does not throw when posthog is undefined", () => {
    expect(() =>
      captureCrossGameNavigation(undefined, { destination: "saily", source_section: "test" })
    ).not.toThrow();
  });

  it("does not throw when posthog has no capture method", () => {
    expect(() =>
      captureCrossGameNavigation({}, { destination: "saily", source_section: "test" })
    ).not.toThrow();
  });
});
