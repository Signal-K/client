"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { getReferralPanelDataAction } from "./actions";
import { Check, Copy, Share2, Sparkles } from "lucide-react";
import { getReferralProgress, REFERRAL_TIERS } from "@/src/features/referrals/referral-progress";

interface ReferredUser {
  id: string;
  email?: string | null;
  username?: string | null;
}

export default function ReferralCodePanel() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getReferralPanelDataAction();
        if (!result.ok) {
          setError(result.error || "Failed to load referral data.");
          setReferredUsers([]);
          setReferralCode(null);
          setLoading(false);
          return;
        }

        setReferralCode(result.data.referralCode);
        setReferredUsers(result.data.referredUsers as ReferredUser[]);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      }

      setLoading(false);
    };

    fetchReferralData();
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!referralCode) return;
    const inviteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth?ref=${encodeURIComponent(referralCode)}`
        : "";
    const shareText = `Join me in Star Sailors. Use my referral code: ${referralCode}${inviteUrl ? ` (${inviteUrl})` : ""}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Star Sailors Invite",
          text: shareText,
        });
        setShared(true);
        setTimeout(() => setShared(false), 1800);
        return;
      } catch {
        // Ignore cancel and fallback to copy.
      }
    }
    navigator.clipboard.writeText(shareText);
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  };

  const stardustEarned = referredUsers.length * 5;
  const progress = getReferralProgress(referredUsers.length);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/90 via-cyan-950/80 to-indigo-950/80 p-5 sm:p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_20px_45px_rgba(0,0,0,0.45)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="absolute left-8 -bottom-10 h-28 w-28 rounded-full bg-indigo-500/20 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">Referral Command</p>
          <Sparkles className="h-4 w-4 text-cyan-300" />
        </div>
        <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white">
          Invite Your Crew
        </h2>
        <p className="mt-1 text-sm text-cyan-100/85">
          Each successful referral grants stardust and grows your expedition network.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-cyan-100 text-sm">
            Referrals completed: <span className="font-semibold">{referredUsers.length}</span>
          </div>
          <div className="rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-amber-100 text-sm">
            Stardust earned: <span className="font-semibold">{stardustEarned}</span>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-cyan-300/25 bg-slate-950/40 p-3">
          <p className="text-[11px] uppercase tracking-wider text-cyan-200/80">Recruiter Progress</p>
          <p className="mt-1 text-sm text-cyan-100">
            {progress.completedTiers.length > 0
              ? progress.completedTiers[progress.completedTiers.length - 1].label
              : "No tier unlocked yet"}
          </p>
          {progress.nextTier ? (
            <p className="text-xs text-cyan-200/80 mt-1">
              {Math.max(0, progress.nextTier.target - referredUsers.length)} more referral
              {Math.max(0, progress.nextTier.target - referredUsers.length) === 1 ? "" : "s"} to reach {progress.nextTier.label}
            </p>
          ) : (
            <p className="text-xs text-emerald-200/90 mt-1">All recruiter tiers unlocked.</p>
          )}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-all"
              style={{ width: `${Math.round(progress.progressToNext * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REFERRAL_TIERS.map((tier) => {
              const unlocked = referredUsers.length >= tier.target;
              return (
                <span
                  key={tier.id}
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    unlocked
                      ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-100"
                      : "border-cyan-300/25 bg-cyan-500/10 text-cyan-200/80"
                  }`}
                >
                  {tier.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-cyan-300/25 bg-slate-950/45 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-cyan-200/80 mb-1">Your referral code</p>
          <code className="font-mono text-base sm:text-lg text-cyan-100 select-text break-all">
            {loading ? "Loading..." : referralCode ?? "N/A"}
          </code>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={handleCopy}
            disabled={!referralCode || loading}
            variant="default"
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 border border-cyan-300/30"
          >
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy Code"}
          </Button>
          <Button
            onClick={handleShare}
            disabled={!referralCode || loading}
            variant="default"
            className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-100 border border-indigo-300/30"
          >
            {shared ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
            {shared ? "Shared" : "Share Invite"}
          </Button>
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-cyan-200/90">
          Referred Users
        </h3>

        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-cyan-300/20 bg-slate-950/35 p-3">
          {loading && <p className="text-center text-cyan-100/80 text-sm">Loading...</p>}
          {error && <p className="text-center text-red-300 text-sm">{error}</p>}

          {!loading && !error && referredUsers.length === 0 && (
            <p className="text-center text-cyan-100/75 text-sm">No users referred yet.</p>
          )}

          <ul className="space-y-2">
            {referredUsers.map((user) => (
              <li
                key={user.id}
                className="px-3 py-2 rounded-md border border-cyan-300/20 bg-cyan-500/8 text-cyan-100 text-sm"
                title={user.email ?? user.username ?? "Unknown"}
              >
                {user.username || user.email || user.id}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
