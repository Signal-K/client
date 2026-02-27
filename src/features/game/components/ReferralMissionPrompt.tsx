"use client";

import { Copy, Rocket, Sparkles, X } from "lucide-react";
import { cn } from "@/src/shared/utils";

interface ReferralMissionPromptProps {
  referralCode: string | null;
  onOpenReferral: () => void;
  onDismiss: () => void;
  onCopyInvite: () => void;
  className?: string;
}

export default function ReferralMissionPrompt({
  referralCode,
  onOpenReferral,
  onDismiss,
  onCopyInvite,
  className,
}: ReferralMissionPromptProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-amber-300/25",
        "bg-gradient-to-br from-amber-500/12 via-orange-500/8 to-slate-900/80",
        "p-4 sm:p-5 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_18px_42px_rgba(0,0,0,0.4)]",
        className
      )}
    >
      <div className="absolute -left-8 -top-10 h-24 w-24 rounded-full bg-amber-300/25 blur-2xl" />
      <div className="absolute right-4 -bottom-10 h-24 w-24 rounded-full bg-orange-300/15 blur-2xl" />

      <button
        type="button"
        aria-label="Dismiss referral mission"
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-md p-1 text-amber-100/70 hover:text-amber-100 hover:bg-amber-100/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative pr-8">
        <p className="text-[11px] uppercase tracking-[0.18em] text-amber-200/85">Mission Brief</p>
        <div className="mt-2 flex items-start gap-2">
          <Rocket className="h-5 w-5 text-amber-300 mt-0.5" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-amber-100">
              Activate Referral Boost
            </h3>
            <p className="text-sm text-amber-100/85 mt-1">
              Add a friend&apos;s referral code in Referral Command to unlock bonus stardust.
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenReferral}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-500/20 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-500/30 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Open Referral Console
          </button>
          {referralCode && (
            <button
              type="button"
              onClick={onCopyInvite}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-300/30 bg-orange-500/15 px-3 py-2 text-sm font-medium text-orange-100 hover:bg-orange-500/25 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy Invite Link
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
