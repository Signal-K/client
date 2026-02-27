import { describe, expect, it } from "vitest";
import { getReferralProgress } from "@/src/features/referrals/referral-progress";

describe("getReferralProgress", () => {
  it("handles zero referrals", () => {
    const result = getReferralProgress(0);
    expect(result.completedTiers).toHaveLength(0);
    expect(result.nextTier?.target).toBe(1);
    expect(result.progressToNext).toBe(0);
  });

  it("tracks in-between tier progress", () => {
    const result = getReferralProgress(4);
    expect(result.completedTiers.map((tier) => tier.target)).toEqual([1, 3]);
    expect(result.nextTier?.target).toBe(5);
    expect(result.progressToNext).toBe(0.5);
  });

  it("caps progress after final tier", () => {
    const result = getReferralProgress(12);
    expect(result.nextTier).toBeNull();
    expect(result.progressToNext).toBe(1);
  });
});
