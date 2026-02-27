"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import { useSessionContext } from "@/src/lib/auth/session-context";
import ReferralBoostCard from "@/src/features/game/components/ReferralBoostCard";
import ReferralCodePanel from "@/src/components/profile/setup/Referrals";

type ReferralSummary = {
  referralCode: string | null;
  referralCount: number;
};

export default function ReferralsPage() {
  const router = useRouter();
  const { isDark, toggleDarkMode } = UseDarkMode();
  const { session, isLoading } = useSessionContext();
  const [summary, setSummary] = useState<ReferralSummary>({
    referralCode: null,
    referralCount: 0,
  });

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/auth");
      return;
    }
  }, [isLoading, session, router]);

  useEffect(() => {
    if (!session) return;

    const fetchSummary = async () => {
      try {
        const response = await fetch("/api/gameplay/research/summary", { cache: "no-store" });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload) return;
        setSummary({
          referralCode: payload.referralCode ?? null,
          referralCount: Number(payload.referralCount ?? 0),
        });
      } catch (error) {
        console.error("Failed to load referral summary", error);
      }
    };

    fetchSummary();
  }, [session]);

  if (!session) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground
          sectorX={0}
          sectorY={0}
          showAllAnomalies={false}
          isDarkTheme={isDark}
          variant="stars-only"
          onAnomalyClick={() => {}}
        />
      </div>

      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 pt-24">
        <div className="mb-4 rounded-xl border border-cyan-300/20 bg-slate-950/35 p-4 text-cyan-50">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Growth Console</p>
          <h1 className="mt-1 text-2xl font-semibold">Referral Command Center</h1>
          <p className="mt-1 text-sm text-cyan-100/80">
            Share your invite, track recruiter tiers, and monitor crewmate growth from one place.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr,1.2fr]">
          <ReferralBoostCard
            referralCode={summary.referralCode}
            referralsCount={summary.referralCount}
          />
          <ReferralCodePanel />
        </div>
      </main>
    </div>
  );
}
