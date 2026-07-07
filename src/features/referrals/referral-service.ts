import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { nanoid } from "nanoid";

/**
 * Service to handle referral logic securely on the server.
 */
export class ReferralService {
  /**
   * Generates a new unique referral code for a profile.
   */
  static async generateUniqueCode(): Promise<string> {
    const pb = await createPocketbaseAdminClient();
    let code = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = nanoid(8).toUpperCase();
      const existing = await pb
        .collection("profiles")
        .getFirstListItem(pb.filter("referralCode = {:c}", { c: code }))
        .catch(() => null);
      if (!existing) isUnique = true;
      attempts++;
    }

    return code;
  }

  /**
   * Ensures a user has a referral code.
   */
  static async ensureReferralCode(userId: string): Promise<string> {
    const pb = await createPocketbaseAdminClient();
    const profile = await pb
      .collection("profiles")
      .getFirstListItem(pb.filter("userId = {:id}", { id: userId }))
      .catch(() => null);

    if (profile?.referralCode) return profile.referralCode;

    const newCode = await this.generateUniqueCode();
    if (profile) {
      await pb.collection("profiles").update(profile.id, { referralCode: newCode });
    } else {
      await pb.collection("profiles").create({ userId, referralCode: newCode, updatedAt: new Date().toISOString() });
    }

    return newCode;
  }

  /**
   * Applies a referral code to a new user.
   * Checks for self-referral, already referred, and valid code.
   */
  static async applyReferral(referreeId: string, code: string) {
    const pb = await createPocketbaseAdminClient();

    // 1. Validate the code exists and get the referrer
    const referrer = await pb
      .collection("profiles")
      .getFirstListItem(pb.filter("referralCode = {:c}", { c: code }))
      .catch(() => null);

    if (!referrer) {
      throw new Error("Invalid referral code.");
    }

    // 2. Prevent self-referral
    if (referrer.userId === referreeId) {
      throw new Error("You cannot refer yourself.");
    }

    // 3. Check if user already used a referral code
    const existingReferral = await pb
      .collection("referrals")
      .getFirstListItem(pb.filter("referreeId = {:id}", { id: referreeId }))
      .catch(() => null);

    if (existingReferral) {
      throw new Error("You have already been referred.");
    }

    // 4. Record the referral. Pocketbase's JS SDK has no cross-collection
    // transaction API, so these are sequential creates, not atomic — accepted
    // given the low stakes (a missed bonus reward is recoverable, unlike the
    // duplicate-referral check above which already guards the important case).
    const referral = await pb.collection("referrals").create({
      referreeId,
      referralCode: code,
      referredAt: new Date().toISOString(),
    });

    // 5. Grant rewards (Stardust) to the referrer
    // Currently using survey_rewards table as a way to grant stardust
    // since there's no direct 'stardust' balance in Profile (it's calculated from rewards)
    await pb.collection("survey_rewards").create({
      userId: referrer.userId,
      surveyId: `referral-${referreeId}`,
      surveyName: "Referral Bonus",
      stardustGranted: 25, // Premium bonus for referring a friend
      createdAt: new Date().toISOString(),
    });

    // Also grant a smaller bonus to the referred user
    await pb.collection("survey_rewards").create({
      userId: referreeId,
      surveyId: `referred-by-${referrer.userId}`,
      surveyName: "Acquisition Bonus",
      stardustGranted: 10,
      createdAt: new Date().toISOString(),
    });

    return referral;
  }

  /**
   * Gets the total number of successful referrals for a user.
   */
  static async getReferralCount(userId: string): Promise<number> {
    const pb = await createPocketbaseAdminClient();
    const profile = await pb
      .collection("profiles")
      .getFirstListItem(pb.filter("userId = {:id}", { id: userId }))
      .catch(() => null);

    if (!profile?.referralCode) return 0;

    const result = await pb.collection("referrals").getList(1, 1, {
      filter: pb.filter("referralCode = {:c}", { c: profile.referralCode }),
    });
    return result.totalItems;
  }
}
