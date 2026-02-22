"use client";

import type { ReactNode } from "react";
import GameNavbar from "@/src/components/layout/Tes";

type SetupScaffoldProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function SetupScaffold({ title, subtitle, children }: SetupScaffoldProps) {
  return (
    <div className="min-h-[100dvh] w-full overflow-hidden bg-[#070b14] text-slate-100">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(251,146,60,0.12),transparent_30%),linear-gradient(180deg,#05070d_0%,#0b1220_55%,#070b14_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px)] [background-size:36px_36px]" />
      </div>

      <div className="relative z-20">
        <GameNavbar />
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
