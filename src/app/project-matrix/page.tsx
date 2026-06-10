"use client";

import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/hooks/useDarkMode";
import { Grid3X3, Telescope, Satellite, User } from "lucide-react";
import Link from "next/link";

export default function ProjectMatrixPage() {
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
          <div className="rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-slate-950/85 via-slate-900/85 to-indigo-950/45 backdrop-blur-md p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-indigo-200/80">Project Matrix</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">Mission Overview</h1>
            <p className="mt-3 text-sm sm:text-base text-indigo-100/80 max-w-2xl">
              A matrix view of all active projects, missions, and citizen science initiatives across the fleet.
            </p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Link
                href="/game"
                className="group rounded-xl border border-indigo-300/35 bg-black/30 p-5 hover:border-indigo-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-indigo-300/30 bg-indigo-500/15 p-2">
                    <Telescope className="h-5 w-5 text-indigo-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Live Missions</p>
                </div>
                <p className="mt-3 text-sm text-indigo-100/80">Active classification and survey missions.</p>
              </Link>

              <Link
                href="/research"
                className="group rounded-xl border border-indigo-300/35 bg-black/30 p-5 hover:border-indigo-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-indigo-300/30 bg-indigo-500/15 p-2">
                    <Satellite className="h-5 w-5 text-indigo-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Research</p>
                </div>
                <p className="mt-3 text-sm text-indigo-100/80">Progression systems and research upgrades.</p>
              </Link>

              <Link
                href="/account"
                className="group rounded-xl border border-indigo-300/35 bg-black/30 p-5 hover:border-indigo-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-indigo-300/30 bg-indigo-500/15 p-2">
                    <User className="h-5 w-5 text-indigo-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Profile</p>
                </div>
                <p className="mt-3 text-sm text-indigo-100/80">Account settings and crew profile.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
