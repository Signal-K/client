"use client";

import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/hooks/useDarkMode";
import { BarChart3, Star, Activity } from "lucide-react";
import Link from "next/link";

export default function ContributionsPage() {
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
          <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-slate-950/85 via-slate-900/85 to-amber-950/45 backdrop-blur-md p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-200/80">Contributions</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">Your Science Impact</h1>
            <p className="mt-3 text-sm sm:text-base text-amber-100/80 max-w-2xl">
              Track your classification history, stardust earnings, and contributions to published research.
            </p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Link
                href="/game"
                className="group rounded-xl border border-amber-300/35 bg-black/30 p-5 hover:border-amber-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-amber-300/30 bg-amber-500/15 p-2">
                    <Activity className="h-5 w-5 text-amber-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Recent Activity</p>
                </div>
                <p className="mt-3 text-sm text-amber-100/80">Your latest classifications and mission activity.</p>
              </Link>

              <Link
                href="/leaderboards"
                className="group rounded-xl border border-amber-300/35 bg-black/30 p-5 hover:border-amber-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-amber-300/30 bg-amber-500/15 p-2">
                    <BarChart3 className="h-5 w-5 text-amber-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Leaderboards</p>
                </div>
                <p className="mt-3 text-sm text-amber-100/80">See how you rank among other crews.</p>
              </Link>

              <Link
                href="/account"
                className="group rounded-xl border border-amber-300/35 bg-black/30 p-5 hover:border-amber-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-amber-300/30 bg-amber-500/15 p-2">
                    <Star className="h-5 w-5 text-amber-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Profile</p>
                </div>
                <p className="mt-3 text-sm text-amber-100/80">Manage your crew profile and settings.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
