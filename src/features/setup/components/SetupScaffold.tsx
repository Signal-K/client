"use client";

import type { ReactNode } from "react";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

type SetupScaffoldProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function SetupScaffold({ title, subtitle, children }: SetupScaffoldProps) {
  const { isDark, toggleDarkMode } = UseDarkMode();

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden text-slate-100">
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

      <div className="relative z-20">
        <MainHeader
          isDark={isDark}
          onThemeToggle={toggleDarkMode}
          notificationsOpen={false}
          onToggleNotifications={() => {}}
          activityFeed={[]}
          otherClassifications={[]}
        />
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-8 pt-20 md:px-6 md:pt-24">
        <header className="rounded-2xl border border-slate-700/60 bg-slate-900/70 px-5 py-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/90">Setup Flow</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-100 md:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  );
}

type SetupCardProps = {
  title: string;
  children: ReactNode;
};

export function SetupCard({ title, children }: SetupCardProps) {
  return (
    <section className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div className="mt-3 text-sm text-slate-300">{children}</div>
    </section>
  );
}
