import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReferralService } from "@/src/features/referrals/referral-service";

// Mock prisma
vi.mock("@/lib/server/prisma", () => ({
  prisma: {
    profile: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    referral: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    surveyReward: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "abcd1234"),
}));

import { prisma } from "@/lib/server/prisma";

const mockPrisma = prisma as {
  profile: { findFirst: ReturnType<typeof vi.fn>; findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  referral: { findFirst: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  surveyReward: { create: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

describe("ReferralService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateUniqueCode", () => {
    it("returns a unique code on first try", async () => {
      mockPrisma.profile.findFirst.mockResolvedValue(null);
      const code = await ReferralService.generateUniqueCode();
      expect(code).toBe("ABCD1234");
      expect(mockPrisma.profile.findFirst).toHaveBeenCalledTimes(1);
    });

    it("retries when code already exists", async () => {
      mockPrisma.profile.findFirst
        .mockResolvedValueOnce({ id: "existing", referralCode: "ABCD1234" })
        .mockResolvedValueOnce(null);
      const code = await ReferralService.generateUniqueCode();
      expect(code).toBe("ABCD1234");
      expect(mockPrisma.profile.findFirst).toHaveBeenCalledTimes(2);
    });

    it("returns code after exhausting retries", async () => {
      // Always finds an existing code — exhausts 10 attempts, returns last generated code
      mockPrisma.profile.findFirst.mockResolvedValue({ id: "x", referralCode: "ABCD1234" });
      const code = await ReferralService.generateUniqueCode();
      expect(code).toBe("ABCD1234");
      expect(mockPrisma.profile.findFirst).toHaveBeenCalledTimes(10);
    });
  });

  describe("ensureReferralCode", () => {
    it("returns existing code if user already has one", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({ referralCode: "EXISTING" });
      const code = await ReferralService.ensureReferralCode("user-1");
      expect(code).toBe("EXISTING");
      expect(mockPrisma.profile.update).not.toHaveBeenCalled();
    });

    it("generates and saves a new code when user has none", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({ referralCode: null });
      mockPrisma.profile.findFirst.mockResolvedValue(null); // unique check passes
      mockPrisma.profile.update.mockResolvedValue({});

      const code = await ReferralService.ensureReferralCode("user-1");
      expect(code).toBe("ABCD1234");
      expect(mockPrisma.profile.update).toHaveBeenCalledWith({
        where: { id: "user-1" },
        data: { referralCode: "ABCD1234" },
      });
    });

    it("generates and saves a new code when user profile is null", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);
      mockPrisma.profile.findFirst.mockResolvedValue(null);
      mockPrisma.profile.update.mockResolvedValue({});

      const code = await ReferralService.ensureReferralCode("user-1");
      expect(code).toBe("ABCD1234");
      expect(mockPrisma.profile.update).toHaveBeenCalled();
    });
  });

  describe("applyReferral", () => {
    it("throws when referral code is invalid", async () => {
      mockPrisma.profile.findFirst.mockResolvedValue(null);
      await expect(ReferralService.applyReferral("user-new", "BADCODE")).rejects.toThrow(
        "Invalid referral code."
      );
    });

    it("throws when referree tries to self-refer", async () => {
      mockPrisma.profile.findFirst.mockResolvedValue({ id: "user-new" });
      await expect(ReferralService.applyReferral("user-new", "MYCODE")).rejects.toThrow(
        "You cannot refer yourself."
      );
    });

    it("throws when user has already been referred", async () => {
      mockPrisma.profile.findFirst.mockResolvedValue({ id: "referrer-id" });
      mockPrisma.referral.findFirst.mockResolvedValue({ id: "existing-referral" });

      await expect(ReferralService.applyReferral("user-new", "GOODCODE")).rejects.toThrow(
        "You have already been referred."
      );
    });

    it("creates referral and grants rewards on success", async () => {
      const fakeReferral = { id: "ref-1", referreeId: "user-new", referralCode: "GOODCODE" };
      mockPrisma.profile.findFirst.mockResolvedValue({ id: "referrer-id" });
      mockPrisma.referral.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
        const tx = {
          referral: { create: vi.fn().mockResolvedValue(fakeReferral) },
          surveyReward: { create: vi.fn().mockResolvedValue({}) },
        };
        return fn(tx as unknown as typeof mockPrisma);
      });

      const result = await ReferralService.applyReferral("user-new", "GOODCODE");
      expect(result).toEqual(fakeReferral);
    });

    it("grants 25 stardust to referrer and 10 to referree", async () => {
      const referralCreated = { id: "ref-1" };
      const txSurveyCreate = vi.fn().mockResolvedValue({});
      const txReferralCreate = vi.fn().mockResolvedValue(referralCreated);

      mockPrisma.profile.findFirst.mockResolvedValue({ id: "referrer-id" });
      mockPrisma.referral.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        return fn({ referral: { create: txReferralCreate }, surveyReward: { create: txSurveyCreate } });
      });

      await ReferralService.applyReferral("user-new", "GOODCODE");

      expect(txSurveyCreate).toHaveBeenCalledTimes(2);
      const calls = txSurveyCreate.mock.calls;
      const referrerCall = calls.find((c: [{ data: { userId: string } }]) => c[0].data.userId === "referrer-id");
      const referreeCall = calls.find((c: [{ data: { userId: string } }]) => c[0].data.userId === "user-new");
      expect(referrerCall[0].data.stardustGranted).toBe(25);
      expect(referreeCall[0].data.stardustGranted).toBe(10);
    });
  });

  describe("getReferralCount", () => {
    it("returns 0 when user has no referral code", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({ referralCode: null });
      const count = await ReferralService.getReferralCount("user-1");
      expect(count).toBe(0);
      expect(mockPrisma.referral.count).not.toHaveBeenCalled();
    });

    it("returns 0 when user profile is null", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);
      const count = await ReferralService.getReferralCount("user-1");
      expect(count).toBe(0);
    });

    it("returns count of referrals for user with a code", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({ referralCode: "MYCODE" });
      mockPrisma.referral.count.mockResolvedValue(5);

      const count = await ReferralService.getReferralCount("user-1");
      expect(count).toBe(5);
      expect(mockPrisma.referral.count).toHaveBeenCalledWith({
        where: { referralCode: "MYCODE" },
      });
    });

    it("returns 0 when no one has used the code yet", async () => {
      mockPrisma.profile.findUnique.mockResolvedValue({ referralCode: "MYCODE" });
      mockPrisma.referral.count.mockResolvedValue(0);

      const count = await ReferralService.getReferralCount("user-1");
      expect(count).toBe(0);
    });
  });
});
