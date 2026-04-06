import { prisma } from "@/lib/server/prisma";
import { nanoid } from "nanoid";

/**
 * Service to handle referral logic securely on the server.
 */
export class ReferralService {
  /**
   * Generates a new unique referral code for a profile.
   */
  static async generateUniqueCode(): Promise<string> {
    let code = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = nanoid(8).toUpperCase();
      const existing = await prisma.profile.findFirst({
        where: { referralCode: code }
      });
      if (!existing) isUnique = true;
      attempts++;
    }

    return code;
  }

  /**
   * Ensures a user has a referral code.
   */
  static async ensureReferralCode(userId: string): Promise<string> {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (profile?.referralCode) return profile.referralCode;

    const newCode = await this.generateUniqueCode();
    await prisma.profile.update({
      where: { id: userId },
      data: { referralCode: newCode }
    });

    return newCode;
  }

  /**
   * Applies a referral code to a new user.
   * Checks for self-referral, already referred, and valid code.
   */
  static async applyReferral(referreeId: string, code: string) {
    // 1. Validate the code exists and get the referrer
    const referrer = await prisma.profile.findFirst({
      where: { referralCode: code },
      select: { id: true }
    });

    if (!referrer) {
      throw new Error("Invalid referral code.");
    }

    // 2. Prevent self-referral
    if (referrer.id === referreeId) {
      throw new Error("You cannot refer yourself.");
    }

    // 3. Check if user already used a referral code
    const existingReferral = await prisma.referral.findFirst({
      where: { referreeId }
    });

    if (existingReferral) {
      throw new Error("You have already been referred.");
    }

    // 4. Record the referral
    return await prisma.$transaction(async (tx) => {
      const referral = await tx.referral.create({
        data: {
          referreeId,
          referralCode: code,
        }
      });

      // 5. Grant rewards (Stardust) to the referrer
      // Currently using survey_rewards table as a way to grant stardust 
      // since there's no direct 'stardust' balance in Profile (it's calculated from rewards)
      await tx.surveyReward.create({
        data: {
          userId: referrer.id,
          surveyId: `referral-${referreeId}`,
          surveyName: "Referral Bonus",
          stardustGranted: 25 // Premium bonus for referring a friend
        }
      });

      // Also grant a smaller bonus to the referred user
      await tx.surveyReward.create({
        data: {
          userId: referreeId,
          surveyId: `referred-by-${referrer.id}`,
          surveyName: "Welcome Bonus",
          stardustGranted: 10
        }
      });

      return referral;
    });
  }

  /**
   * Gets the total number of successful referrals for a user.
   */
  static async getReferralCount(userId: string): Promise<number> {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { referralCode: true }
    });

    if (!profile?.referralCode) return 0;

    return await prisma.referral.count({
      where: { referralCode: profile.referralCode }
    });
  }
}
