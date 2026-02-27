"use client";

import { useMemo, useState } from "react";
import { Share2, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/src/shared/utils";
import { getReferralProgress } from "@/src/features/referrals/referral-progress";

interface ReferralBoostCardProps {
  referralCode: string | null;
  referralsCount: number;
  className?: string;
}

export default function ReferralBoostCard({
  referralCode,
  referralsCount,
  className,
}: ReferralBoostCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const rewardEstimate = referralsCount * 5;
  const progress = getReferralProgress(referralsCount);
  const referralShareText = useMemo(() => {
    if (!referralCode) return "";
    const inviteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth?ref=${encodeURIComponent(referralCode)}`
        : "";
    return `Join me in Star Sailors. Use my referral code: ${referralCode}${inviteUrl ? ` (${inviteUrl})` : ""}`;
  }, [referralCode]);

  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Star Sailors Referral",
          text: referralShareText,
        });
        setShared(true);
        setTimeout(() => setShared(false), 1800);
        return;
      } catch {
        // Ignore canceled shares.
      }
    }
    await handleCopy();
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cyan-400/30",
        "bg-gradient-to-br from-cyan-950/80 via-slate-900/90 to-indigo-950/80",
        "shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_18px_40px_rgba(0,0,0,0.45)] p-4 sm:p-5",
        className
      )}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="absolute left-8 -bottom-8 h-24 w-24 rounded-full bg-indigo-500/20 blur-2xl" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/90">Referral Boost</p>
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-white">
          Invite crewmates, grow your stardust.
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-cyan-100/90">
          <span className="rounded-full bg-cyan-500/20 px-2.5 py-1 border border-cyan-300/30">
            Referrals: {referralsCount}
          </span>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-1 border border-amber-300/30">
            Stardust earned: {rewardEstimate}
          </span>
        </div>

        <div className="rounded-lg border border-cyan-300/20 bg-slate-950/35 p-3">
          <p className="text-[11px] uppercase tracking-wider text-cyan-200/80">
            Recruiter Tier
          </p>
          <p className="mt-1 text-sm text-cyan-100">
            {progress.completedTiers.length > 0
              ? progress.completedTiers[progress.completedTiers.length - 1].label
              : "No tier unlocked yet"}
          </p>
          {progress.nextTier ? (
            <p className="mt-1 text-xs text-cyan-200/80">
              Next: {progress.nextTier.label} at {progress.nextTier.target} referrals
            </p>
          ) : (
            <p className="mt-1 text-xs text-emerald-200/85">Top tier reached.</p>
          )}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all"
              style={{ width: `${Math.round(progress.progressToNext * 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border border-cyan-300/25 bg-slate-950/40 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wider text-cyan-200/80 mb-1">Your code</p>
          <p className="font-mono text-sm sm:text-base text-cyan-100 break-all">
            {referralCode ?? "Create your profile to unlock your referral code"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            disabled={!referralCode}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-500/15 px-3 py-2 text-sm font-medium text-cyan-100 hover:bg-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied" : "Copy Code"}
          </button>
          <button
            onClick={handleShare}
            disabled={!referralCode}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-300/30 bg-indigo-500/15 px-3 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {shared ? "Shared" : "Share Invite"}
          </button>
        </div>
      </div>
    </section>
  );
}
