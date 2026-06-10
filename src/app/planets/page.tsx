"use client";

import Link from "next/link";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/hooks/useDarkMode";
import { Globe, Edit, Cloud } from "lucide-react";

export default function PlanetsPage() {
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
          <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-slate-950/85 via-slate-900/85 to-emerald-950/45 backdrop-blur-md p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/80">Planets Command</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-white">Explore Known Worlds</h1>
            <p className="mt-3 text-sm sm:text-base text-emerald-100/80 max-w-2xl">
              Browse discovered planets, edit surface details, and track atmospheric conditions across the sector.
            </p>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Link
                href="/planets/edit"
                className="group rounded-xl border border-emerald-300/35 bg-black/30 p-5 hover:border-emerald-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 p-2">
                    <Edit className="h-5 w-5 text-emerald-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Edit Planets</p>
                </div>
                <p className="mt-3 text-sm text-emerald-100/80">Modify surface composition and discovered world data.</p>
              </Link>

              <Link
                href="/planets/clouds"
                className="group rounded-xl border border-emerald-300/35 bg-black/30 p-5 hover:border-emerald-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 p-2">
                    <Cloud className="h-5 w-5 text-emerald-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Cloud Atlas</p>
                </div>
                <p className="mt-3 text-sm text-emerald-100/80">Review atmospheric cloud classification data.</p>
              </Link>

              <Link
                href="/ecosystem"
                className="group rounded-xl border border-emerald-300/35 bg-black/30 p-5 hover:border-emerald-200/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-emerald-300/30 bg-emerald-500/15 p-2">
                    <Globe className="h-5 w-5 text-emerald-200" />
                  </div>
                  <p className="text-base font-semibold text-white">Ecosystem</p>
                </div>
                <p className="mt-3 text-sm text-emerald-100/80">View the broader mission network and connected worlds.</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
