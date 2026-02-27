export type ReferralTier = {
  id: string;
  label: string;
  target: number;
};

export const REFERRAL_TIERS: ReferralTier[] = [
  { id: "cadet", label: "Cadet Recruiter", target: 1 },
  { id: "navigator", label: "Navigator Recruiter", target: 3 },
  { id: "captain", label: "Captain Recruiter", target: 5 },
  { id: "admiral", label: "Admiral Recruiter", target: 10 },
];

export type ReferralProgress = {
  referralsCount: number;
  completedTiers: ReferralTier[];
  nextTier: ReferralTier | null;
  progressToNext: number;
};

export function getReferralProgress(referralsCount: number): ReferralProgress {
  const safeCount = Number.isFinite(referralsCount) ? Math.max(0, Math.floor(referralsCount)) : 0;
  const completedTiers = REFERRAL_TIERS.filter((tier) => safeCount >= tier.target);
  const nextTier = REFERRAL_TIERS.find((tier) => safeCount < tier.target) ?? null;

  if (!nextTier) {
    return {
      referralsCount: safeCount,
      completedTiers,
      nextTier: null,
      progressToNext: 1,
    };
  }

  const previousTarget = completedTiers.length > 0 ? completedTiers[completedTiers.length - 1].target : 0;
  const span = Math.max(1, nextTier.target - previousTarget);
  const progressToNext = Math.min(1, Math.max(0, (safeCount - previousTarget) / span));

  return {
    referralsCount: safeCount,
    completedTiers,
    nextTier,
    progressToNext,
  };
}
