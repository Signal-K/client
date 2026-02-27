"use client";

import Link from "next/link";
import { Compass, ExternalLink, Gamepad2, Microscope, Orbit } from "lucide-react";

export default function EcosystemMissionsCard() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-violet-300/25 bg-gradient-to-br from-violet-500/10 via-slate-900/80 to-cyan-950/55 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(167,139,250,0.08),0_20px_45px_rgba(0,0,0,0.45)]">
      <div className="absolute -left-8 -top-10 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl" />
      <div className="absolute right-8 -bottom-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-violet-200/85">
            Ecosystem Missions
          </p>
          <Compass className="h-4 w-4 text-violet-200" />
        </div>

        <h3 className="mt-2 text-base sm:text-lg font-semibold text-white">
          Citizen Science Across Worlds
        </h3>
        <p className="mt-1 text-sm text-violet-100/80">
          Main-web missions feed upcoming field simulations so discoveries and mechanics can evolve together.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
          <Link
            href="/scenes/uploads"
            className="rounded-lg border border-cyan-300/30 bg-cyan-500/10 p-3 hover:bg-cyan-500/20 transition-colors"
          >
            <p className="flex items-center gap-2 text-cyan-100 font-medium">
              <Microscope className="h-4 w-4" />
              Active Web Missions
            </p>
            <p className="mt-1 text-cyan-100/75 text-xs">Conservation and classification loops</p>
          </Link>

          <Link
            href="/research"
            className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3 hover:bg-amber-500/20 transition-colors"
          >
            <p className="flex items-center gap-2 text-amber-100 font-medium">
              <Orbit className="h-4 w-4" />
              System Upgrades
            </p>
            <p className="mt-1 text-amber-100/75 text-xs">Unlock mechanics used by future minigames</p>
          </Link>
        </div>

        <div className="mt-3 rounded-lg border border-violet-300/25 bg-violet-500/10 p-3">
          <p className="flex items-center gap-2 text-violet-100 text-sm font-medium">
            <Gamepad2 className="h-4 w-4" />
            Next Expansion: Field Sim Prototypes
          </p>
          <p className="mt-1 text-violet-100/75 text-xs">
            First target: mining and planet-hunter loops in Godot, connected back to crew progression.
          </p>
        </div>

        <div className="mt-3">
          <Link
            href="/leaderboards"
            className="inline-flex items-center gap-2 text-xs text-violet-200 hover:text-violet-100 transition-colors"
          >
            Follow ecosystem rankings
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
