"use client";

import Link from "next/link";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { Trophy, Sparkles, Rocket } from "lucide-react";

export default function LeaderboardsPage() {
  const { isDark, toggleDarkMode } = UseDarkMode();

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
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

      <main className="pt-24 px-4 sm:px-6 pb-10">
        <section className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-950/85 via-slate-900/85 to-cyan-950/45 backdrop-blur-md p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/80">Leaderboard Command</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">Track The Strongest Crews</h1>
            <p className="mt-3 text-sm sm:text-base text-cyan-100/80 max-w-2xl">
              Rankings are now mission-specific. Start with Sunspots and recruit more explorers with your referral code to climb faster.
            </p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Link
                href="/leaderboards/sunspots"
                className="group rounded-xl border border-cyan-300/35 bg-black/30 p-5 hover:border-cyan-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-cyan-300/30 bg-cyan-500/15 p-2">
                    <Trophy className="h-5 w-5 text-cyan-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Sunspots Board</p>
                </div>
                <p className="mt-3 text-sm text-cyan-100/80">Live global ranking for current sunspot missions.</p>
                <p className="mt-4 text-sm text-cyan-200 group-hover:text-cyan-100">Open board</p>
              </Link>

              <Link
                href="/referrals"
                className="group rounded-xl border border-amber-300/35 bg-black/30 p-5 hover:border-amber-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-amber-300/30 bg-amber-500/15 p-2">
                    <Rocket className="h-5 w-5 text-amber-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Referral Boost</p>
                </div>
                <p className="mt-3 text-sm text-amber-100/80">Invite new pilots and accelerate your progression rewards.</p>
                <p className="mt-4 text-sm text-amber-200 group-hover:text-amber-100">Open referral panel</p>
              </Link>
            </div>

            <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-500/10 p-3 text-xs sm:text-sm text-cyan-100/85 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-200 shrink-0" />
              More mission boards are in rollout as new citizen science game modes come online.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
