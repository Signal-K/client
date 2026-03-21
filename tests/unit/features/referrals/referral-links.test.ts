import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSailyUrl,
  buildClientReferralUrl,
  buildReferralShareText,
} from "@/features/referrals/referral-links";

describe("referral-links", () => {
  describe("getSailyUrl", () => {
    it("returns default saily URL without referral code", () => {
      const url = getSailyUrl();
      expect(url).toContain("starsailors.space");
      expect(url).not.toContain("ref=");
    });

    it("appends ref param when referral code provided", () => {
      const url = getSailyUrl("ABC123");
      expect(url).toContain("ref=ABC123");
    });

    it("does not append ref param for null", () => {
      const url = getSailyUrl(null);
      expect(url).not.toContain("ref=");
    });

    it("does not append ref param for empty string", () => {
      const url = getSailyUrl("");
      expect(url).not.toContain("ref=");
    });
  });

  describe("buildClientReferralUrl", () => {
    it("builds URL with ref param using provided origin", () => {
      const url = buildClientReferralUrl("CODE42", "https://example.com");
      expect(url).toBe("https://example.com/auth?ref=CODE42");
    });

    it("returns empty string when no origin and no window", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      const url = buildClientReferralUrl("CODE42");
      expect(url).toBe("");
      global.window = originalWindow;
    });

    it("uses window.location.origin when no origin provided", () => {
      Object.defineProperty(window, "location", {
        value: { origin: "https://myapp.com" },
        writable: true,
      });
      const url = buildClientReferralUrl("XYZ");
      expect(url).toContain("https://myapp.com/auth?ref=XYZ");
    });
  });

  describe("buildReferralShareText", () => {
    it("includes referral code in share text", () => {
      const text = buildReferralShareText("MYCODE", "https://example.com");
      expect(text).toContain("MYCODE");
    });

    it("includes client URL when origin provided", () => {
      const text = buildReferralShareText("MYCODE", "https://example.com");
      expect(text).toContain("https://example.com/auth?ref=MYCODE");
    });

    it("includes saily URL", () => {
      const text = buildReferralShareText("MYCODE", "https://example.com");
      expect(text).toContain("starsailors.space");
    });
  });
});
