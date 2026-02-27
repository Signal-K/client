"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { VariantSwitcher } from "@/src/components/landing/VariantSwitcher";

// TODO(task-tdi1lj): Replace with confirmed Experiment 1 Godot build URL
const EXPERIMENT_1_URL = "/auth";
const SAILY_URL = "https://thedailysail.starsailors.space";

const panels = [
  {
    key: "web-client",
    image: "/assets/Images/landing2.jpg",
    color: "from-teal-900/90",
    accent: "text-teal-300",
    divider: "bg-teal-400",
    number: "I",
    who: "Strategy & science explorer",
    name: "Star Sailors",
    pitch: "You want depth. Multiple structures to deploy, 10+ research missions, a real resource loop.",
    time: "30–90 min sessions",
    cta: "Start here →",
    href: "/auth",
    external: false,
  },
  {
    key: "experiment-1",
    image: "/assets/Images/landing3.jpg",
    color: "from-amber-900/90",
    accent: "text-amber-300",
    divider: "bg-amber-400",
    number: "II",
    who: "Game-first player",
    name: "Experiment 1",
    pitch: "You want missions. Build a rocket, pick a real target, scan it with live telescope data.",
    time: "10–30 min sessions",
    cta: "Play now →",
    href: EXPERIMENT_1_URL,
    external: false,
  },
  {
    key: "saily",
    image: "/assets/Images/landing4.jpg",
    color: "from-sky-900/90",
    accent: "text-sky-300",
    divider: "bg-sky-400",
    number: "III",
    who: "Daily puzzle player",
    name: "Saily",
    pitch: "You want routine. One telescope anomaly a day, annotate it solo, track your streak.",
    time: "~5 min daily",
    cta: "Open Saily ↗",
    href: SAILY_URL,
    external: true,
  },
];

export default function V5Page() {
  const posthog = usePostHog();
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => { posthog?.capture("landing_page_viewed", { variant: "v5" }); }, [posthog]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      {/* Minimal nav */}
      <header className="z-50 flex items-center justify-between px-6 py-5 sm:px-8">
        <span className="text-sm font-black uppercase tracking-[0.2em]">Star Sailors</span>
        <span className="text-xs text-gray-500 uppercase tracking-widest">Citizen Science</span>
      </header>

      {/* Question headline */}
      <div className="px-6 pb-8 pt-2 text-center sm:px-8">
        <h1 className="text-3xl font-black sm:text-5xl">Which explorer are you?</h1>
        <p className="mt-2 text-sm text-gray-400">Pick a panel to go straight to your experience.</p>
      </div>

      {/* 3-panel chooser */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {panels.map((p) => {
          const expanded = hover === p.key;
          return (
            <div
              key={p.key}
              className={`group relative overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
                hover === null
                  ? "lg:flex-1"
                  : expanded
                  ? "lg:flex-[2.5]"
                  : "lg:flex-[0.6]"
              } min-h-[280px] lg:min-h-0`}
              onMouseEnter={() => setHover(p.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(p.key)}
              onBlur={() => setHover(null)}
            >
              {/* Background image */}
              <Image src={p.image} alt="" fill className="object-cover object-center transition-transform duration-700 group-hover:scale-105" aria-hidden />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${p.color} via-gray-950/60 to-gray-950/80`} aria-hidden />

              {/* Content */}
              <div className="relative flex h-full flex-col justify-end p-7 sm:p-10">
                <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${p.accent}`}>{p.who}</p>
                <div className={`mb-3 h-0.5 w-8 ${p.divider}`} aria-hidden />
                <h2 className="text-3xl font-black leading-tight sm:text-4xl">{p.name}</h2>

                {/* Revealed on hover */}
                <div className={`mt-3 overflow-hidden transition-all duration-500 ${expanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="text-sm text-white/80 leading-relaxed">{p.pitch}</p>
                  <p className={`mt-2 text-xs font-semibold ${p.accent}`}>{p.time}</p>
                </div>

                <div className="mt-5">
                  {p.external ? (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${p.cta} — opens in new tab`}
                      onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}
                      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-white/30 px-5 py-2 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-gray-900`}
                    >
                      {p.cta} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  ) : (
                    <Link
                      href={p.href}
                      aria-label={p.cta}
                      onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-white/30 px-5 py-2 text-sm font-bold text-white transition hover:border-white hover:bg-white hover:text-gray-900"
                    >
                      {p.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  )}
                </div>

                {/* Large background number */}
                <span className="pointer-events-none absolute right-5 top-5 select-none text-8xl font-black text-white/5 lg:text-9xl">{p.number}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Click-A-Coral + footer row */}
      <div className="border-t border-gray-800 px-6 py-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-500">Click-A-Coral</span> — coral citizen science game, in development. No ETA.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-700">
            <a href="/terms" className="hover:text-gray-400">Terms</a>
            <a href="/privacy" className="hover:text-gray-400">Privacy</a>
            <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="hover:text-gray-400">GitHub</a>
            <span>© 2026 Star Sailors</span>
          </div>
        </div>
      </div>

      <VariantSwitcher />
    </div>
  );
}
